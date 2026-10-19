import UIKit
import WebKit
import UniformTypeIdentifiers

/*  Brunian Lifts, wrapped.

    The whole point of this wrapper is iOS Screen Time. Downtime blocks web
    content outright — adding Safari to Always Allowed does not help, and a
    home-screen web clip inherits that block — but an installed app can be put
    on the Always Allowed list. So the app is the same JavaScript, served from
    inside the bundle rather than over the network.

    Two decisions worth knowing about before changing anything here:

    1. The files are served through a custom URL scheme, not file:// and not a
       localhost HTTP server. file:// gives web storage no stable origin, so the
       ledger could be dropped. A localhost server would make this an http(s)
       page again, which is the exact thing Downtime blocks — it would defeat
       the purpose of building this at all. A custom scheme gives a stable
       origin that localStorage and IndexedDB persist against, and is not http.

    2. The web app's own data lives in this app's container, which is NOT the
       same container as the website in Safari. They are two ledgers unless Gist
       sync is switched on in both. Turn it on before you rely on this.
*/

private let appScheme = "brunianlifts"
private let appHost = "app"

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  func application(_ application: UIApplication,
                   didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let window = UIWindow(frame: UIScreen.main.bounds)
    window.rootViewController = WebAppViewController()
    window.makeKeyAndVisible()
    self.window = window
    return true
  }
}

final class WebAppViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKDownloadDelegate {
  private var webView: WKWebView!
  private var exportURL: URL?
  private var recoveries = 0

  override func loadView() {
    let config = WKWebViewConfiguration()
    config.setURLSchemeHandler(BundleSchemeHandler(), forURLScheme: appScheme)
    // Persistent, not ephemeral: the ledger has to survive a force-quit.
    config.websiteDataStore = .default()
    config.allowsInlineMediaPlayback = true
    config.mediaTypesRequiringUserActionForPlayback = []

    /* The web app asks for a screen wake lock while a session is running. That
       API needs a secure context and a custom scheme is not one, so in here it
       is unavailable and the screen would sleep between sets — something the
       website does not do. The same request arrives on this channel instead. */
    config.userContentController.add(WakeBridge.shared, name: "wake")

    /* Backing up without an account. Setting up the GitHub sync meant creating a
       fine-grained token and pasting it with a gist id, on a phone, which is a
       miserable thing to ask of anyone. iCloud proper is not available here —
       that capability needs the paid developer programme — but the document
       picker grants sandboxed access to any location the user chooses, iCloud
       Drive included, with no entitlement and no account. He picks a folder
       once; the ledger is written there on every save and iCloud carries it. */
    // A replying handler registers differently: postMessage returns a promise on
    // the JS side, which is what lets the web app wait for the real result.
    config.userContentController.addScriptMessageHandler(BackupBridge.shared, contentWorld: .page, name: "backup")

    let web = WKWebView(frame: .zero, configuration: config)
    web.navigationDelegate = self
    web.uiDelegate = self
    web.scrollView.contentInsetAdjustmentBehavior = .never
    web.isOpaque = false
    web.backgroundColor = UIColor(red: 0.043, green: 0.051, blue: 0.071, alpha: 1) // --bg
    web.scrollView.backgroundColor = web.backgroundColor
    web.scrollView.bounces = false
    if #available(iOS 16.4, *) { web.isInspectable = true }   // Safari Web Inspector over USB
    self.webView = web
    self.view = web
  }

  override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = webView.backgroundColor
    load()
  }

  private func load() {
    var c = URLComponents()
    c.scheme = appScheme
    c.host = appHost
    c.path = "/index.html"
    webView.load(URLRequest(url: c.url!))
  }

  /*  Anything that is not our own scheme — the demo GIFs, a link out — is
      either left to the web view or handed to Safari, never loaded as the top
      page, so the app can never navigate away from itself and strand him.

      The download branch has to come first. "Back up my data" in the web app
      builds a blob and clicks an <a download>. In a web view that arrives here
      as a navigation wanting to download, and if it is treated as an ordinary
      link it gets handed to Safari — which cannot see a blob belonging to this
      web view, so nothing is saved. The web app meanwhile records the export as
      done and stops reminding him. A backup button that quietly writes nothing
      is worse than no backup button. */
  func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
               preferences: WKWebpagePreferences,
               decisionHandler: @escaping (WKNavigationActionPolicy, WKWebpagePreferences) -> Void) {
    if action.shouldPerformDownload { return decisionHandler(.download, preferences) }
    guard let url = action.request.url else { return decisionHandler(.allow, preferences) }
    if url.scheme == appScheme { return decisionHandler(.allow, preferences) }
    if action.navigationType == .linkActivated {
      UIApplication.shared.open(url)
      return decisionHandler(.cancel, preferences)
    }
    decisionHandler(.allow, preferences)   // subresources: images, the Gist API
  }

  func webView(_ webView: WKWebView, decidePolicyFor response: WKNavigationResponse,
               decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
    decisionHandler(response.canShowMIMEType ? .allow : .download)
  }

  func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) {
    download.delegate = self
  }

  func webView(_ webView: WKWebView, navigationResponse: WKNavigationResponse, didBecome download: WKDownload) {
    download.delegate = self
  }

  /* When WebKit's content process dies — memory pressure, a decoder falling
     over, anything — the web view does not show an error. It goes blank and
     stays blank, and the only way back is to force-quit the app and reopen it.
     That is the "keeps crashing, forcing reload" shape exactly. Reloading on
     the spot turns a dead app into a flicker. Nothing is lost by reloading:
     the ledger lives in storage, not in the page.

     It is logged rather than swallowed, so if this starts firing often the
     Console says so instead of it looking like an app that occasionally
     blinks. */
  func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
    recoveries += 1
    NSLog("[Lifts] web content process terminated (%d this launch) — reloading", recoveries)
    load()
  }

  // A blank-target link would otherwise open nothing at all.
  func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
               for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
    if let url = action.request.url, url.scheme != appScheme { UIApplication.shared.open(url) }
    return nil
  }
}

extension WebAppViewController {
  /*  The exported ledger is written to a real file and then offered through the
      share sheet, so it can land in Files, iCloud Drive or anywhere else he can
      get it back from. Errors are shown rather than swallowed: a failed export
      he does not know about is the whole problem being fixed here. */
  func download(_ download: WKDownload, decideDestinationUsing response: URLResponse,
                suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
    let name = suggestedFilename.isEmpty ? "brunian-lifts.json" : suggestedFilename
    let dir = FileManager.default.temporaryDirectory.appendingPathComponent("exports", isDirectory: true)
    try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    let url = dir.appendingPathComponent(name)
    try? FileManager.default.removeItem(at: url)   // the destination must not already exist
    exportURL = url
    completionHandler(url)
  }

  func downloadDidFinish(_ download: WKDownload) {
    guard let url = exportURL else { return }
    let share = UIActivityViewController(activityItems: [url], applicationActivities: nil)
    share.popoverPresentationController?.sourceView = view
    share.popoverPresentationController?.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1)
    present(share, animated: true)
  }

  func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
    say("Export failed", error.localizedDescription + "\n\nYour data is untouched, but this backup did not save. Try again, or use cloud sync.")
  }

  private func say(_ title: String, _ message: String) {
    let a = UIAlertController(title: title, message: message, preferredStyle: .alert)
    a.addAction(UIAlertAction(title: "OK", style: .default))
    present(a, animated: true)
  }
}

/*  Holds the screen awake while a workout is open, and only then. Mirrors what
    navigator.wakeLock does for the website, so a session behaves the same in
    both. Deliberately not a blanket "never sleep": it follows the web app's own
    lifecycle, and the idle timer is released when the app leaves the
    foreground so a forgotten session cannot flatten the battery in a pocket. */
final class WakeBridge: NSObject, WKScriptMessageHandler {
  static let shared = WakeBridge()
  private var wanted = false

  override init() {
    super.init()
    let nc = NotificationCenter.default
    nc.addObserver(self, selector: #selector(background), name: UIApplication.didEnterBackgroundNotification, object: nil)
    nc.addObserver(self, selector: #selector(foreground), name: UIApplication.didBecomeActiveNotification, object: nil)
  }

  func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
    guard message.name == "wake" else { return }
    wanted = (message.body as? Bool) ?? ((message.body as? NSNumber)?.boolValue ?? false)
    apply()
  }

  @objc private func background() { UIApplication.shared.isIdleTimerDisabled = false }
  @objc private func foreground() { apply() }
  private func apply() { UIApplication.shared.isIdleTimerDisabled = wanted }
}

/*  Writes the ledger to a folder the user picked once.

    The access comes from the pick itself: UIDocumentPicker hands back a
    security-scoped URL, and a bookmark made from it survives relaunches, so
    there is nothing to sign in to and no token to keep. If that folder is in
    iCloud Drive then iCloud does the syncing, which is the whole trick.

    Every reply carries what actually happened. The web app is not allowed to
    claim a backup succeeded on optimism — a backup that silently stopped
    working is worse than none, because it is trusted. */
final class BackupBridge: NSObject, WKScriptMessageHandlerWithReply, UIDocumentPickerDelegate {
  static let shared = BackupBridge()
  private let bookmarkKey = "backupFolderBookmark"
  private var pickReply: ((Any?, String?) -> Void)?

  private var folder: URL? {
    guard let data = UserDefaults.standard.data(forKey: bookmarkKey) else { return nil }
    var stale = false
    guard let url = try? URL(resolvingBookmarkData: data, bookmarkDataIsStale: &stale) else { return nil }
    if stale, let fresh = try? url.bookmarkData() { UserDefaults.standard.set(fresh, forKey: bookmarkKey) }
    return url
  }

  func userContentController(_ c: WKUserContentController, didReceive message: WKScriptMessage,
                             replyHandler: @escaping (Any?, String?) -> Void) {
    let body = message.body as? [String: Any] ?? [:]
    switch body["op"] as? String ?? "" {
    case "status":
      replyHandler(["available": true, "folder": folder?.lastPathComponent ?? "",
                    "configured": folder != nil, "lastWrite": UserDefaults.standard.double(forKey: "backupLastWrite")], nil)
    case "choose":
      pickReply = replyHandler
      let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.folder])
      picker.delegate = self
      picker.allowsMultipleSelection = false
      topController()?.present(picker, animated: true)
    case "write":
      guard let json = body["json"] as? String else { return replyHandler(nil, "nothing to write") }
      write(json, replyHandler)
    case "read":
      read(replyHandler)
    default:
      replyHandler(nil, "unknown operation")
    }
  }

  private func write(_ json: String, _ reply: @escaping (Any?, String?) -> Void) {
    guard let dir = folder else { return reply(nil, "no folder chosen yet") }
    guard dir.startAccessingSecurityScopedResource() else { return reply(nil, "that folder is no longer reachable — choose it again") }
    defer { dir.stopAccessingSecurityScopedResource() }
    let target = dir.appendingPathComponent("brunian-lifts.json")
    var failure: String?
    /* Coordinated because the folder may be in iCloud Drive and something else
       may be reading it; atomic so a half-written ledger can never replace a
       whole one. */
    NSFileCoordinator().coordinate(writingItemAt: target, options: .forReplacing, error: nil) { url in
      do { try Data(json.utf8).write(to: url, options: .atomic) }
      catch { failure = error.localizedDescription }
    }
    if let failure { return reply(nil, failure) }
    UserDefaults.standard.set(Date().timeIntervalSince1970 * 1000, forKey: "backupLastWrite")
    reply(["bytes": json.utf8.count, "at": Date().timeIntervalSince1970 * 1000], nil)
  }

  private func read(_ reply: @escaping (Any?, String?) -> Void) {
    guard let dir = folder else { return reply(nil, "no folder chosen yet") }
    guard dir.startAccessingSecurityScopedResource() else { return reply(nil, "that folder is no longer reachable — choose it again") }
    defer { dir.stopAccessingSecurityScopedResource() }
    let target = dir.appendingPathComponent("brunian-lifts.json")
    var json: String?
    var failure: String?
    NSFileCoordinator().coordinate(readingItemAt: target, options: [], error: nil) { url in
      do { json = String(data: try Data(contentsOf: url), encoding: .utf8) }
      catch { failure = "no backup in that folder yet" }
    }
    if let json { reply(["json": json], nil) } else { reply(nil, failure ?? "could not read the backup") }
  }

  func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
    defer { pickReply = nil }
    guard let url = urls.first, let data = try? url.bookmarkData() else {
      return pickReply?(nil, "could not keep access to that folder") ?? ()
    }
    UserDefaults.standard.set(data, forKey: bookmarkKey)
    pickReply?(["folder": url.lastPathComponent], nil)
  }

  func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
    pickReply?(nil, "cancelled"); pickReply = nil
  }

  private func topController() -> UIViewController? {
    var top = (UIApplication.shared.connectedScenes.first as? UIWindowScene)?
      .windows.first(where: { $0.isKeyWindow })?.rootViewController
    while let presented = top?.presentedViewController { top = presented }
    return top
  }
}

/*  Serves the bundled copy of the web app. Kept deliberately narrow: it only
    ever returns files that are actually inside www/, and a path that tries to
    climb out of it gets a 404 rather than a file from elsewhere in the bundle. */
final class BundleSchemeHandler: NSObject, WKURLSchemeHandler {
  private static let types = [
    "html": "text/html; charset=utf-8",
    "js":   "text/javascript; charset=utf-8",
    "css":  "text/css; charset=utf-8",
    "json": "application/json",
    "webmanifest": "application/manifest+json",
    "png":  "image/png",
    "svg":  "image/svg+xml",
    "gif":  "image/gif",
    // Without these a video is served as application/octet-stream and WebKit
    // refuses to play it. The demos were silently dead for exactly this reason.
    "mp4":  "video/mp4",
    "m4v":  "video/mp4",
    "mov":  "video/quicktime",
    "webm": "video/webm"
  ]

  func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
    guard let url = task.request.url, url.host == appHost,
          let root = Bundle.main.url(forResource: "www", withExtension: nil) else {
      return fail(task, url: task.request.url)
    }
    var rel = url.path
    if rel.isEmpty || rel == "/" { rel = "/index.html" }
    let target = root.appendingPathComponent(rel).standardizedFileURL

    // standardizedFileURL has already resolved any "..", so this comparison is
    // what stops a crafted path reading outside www/. The trailing slash matters:
    // without it a sibling directory whose name merely starts with "www" would
    // also satisfy the prefix.
    let rootPath = root.standardizedFileURL.path
    guard target.path == rootPath || target.path.hasPrefix(rootPath + "/"),
          let total = (try? FileManager.default.attributesOfItem(atPath: target.path)[.size] as? Int) ?? nil,
          let handle = try? FileHandle(forReadingFrom: target) else {
      return fail(task, url: url)
    }
    defer { try? handle.close() }

    let mime = Self.types[target.pathExtension.lowercased()] ?? "application/octet-stream"

    /* A video is not fetched the way a script is. WebKit's media loader asks for
       byte ranges — it wants the moov atom, then it seeks — and a handler that
       answers every request with the whole file and a 200 gives it nothing it
       can use, so playback never starts. Answering the range it actually asked
       for, with a 206, is what makes a <video> work on a custom scheme. */
    if let header = task.request.value(forHTTPHeaderField: "Range"),
       let (lower, upper) = Self.parseRange(header, total: total) {
      let length = upper - lower + 1
      if lower > 0 { try? handle.seek(toOffset: UInt64(lower)) }
      let data = (try? handle.read(upToCount: length)) ?? Data()
      let response = HTTPURLResponse(url: url, statusCode: 206, httpVersion: "HTTP/1.1",
        headerFields: ["Content-Type": mime,
                       "Content-Length": String(data.count),
                       "Content-Range": "bytes \(lower)-\(upper)/\(total)",
                       "Accept-Ranges": "bytes",
                       "Cache-Control": "no-store"])!
      task.didReceive(response)
      task.didReceive(data)
      task.didFinish()
      return
    }

    let data = (try? handle.readToEnd()) ?? Data()
    let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1",
      headerFields: ["Content-Type": mime,
                     "Content-Length": String(data.count),
                     // Announced even on a whole-file reply: without it the media
                     // loader may not try a range request at all.
                     "Accept-Ranges": "bytes",
                     "Cache-Control": "no-store"])!
    task.didReceive(response)
    task.didReceive(data)
    task.didFinish()
  }

  /* "bytes=0-1023", "bytes=1024-" and the suffix form "bytes=-500". Returns an
     inclusive pair clamped to the file, or nil when the header is anything else
     — in which case the caller sends the whole file, which is the correct
     fallback for a range it does not understand. */
  static func parseRange(_ header: String, total: Int) -> (Int, Int)? {
    guard total > 0 else { return nil }
    let spec = header.replacingOccurrences(of: " ", with: "")
    guard spec.hasPrefix("bytes="), !spec.contains(",") else { return nil }
    let parts = spec.dropFirst("bytes=".count).split(separator: "-", omittingEmptySubsequences: false)
    guard parts.count == 2 else { return nil }
    let first = String(parts[0]), last = String(parts[1])

    if first.isEmpty {                               // bytes=-500 : the last 500 bytes
      guard let n = Int(last), n > 0 else { return nil }
      return (max(0, total - n), total - 1)
    }
    guard let lower = Int(first), lower < total else { return nil }
    let upper = last.isEmpty ? total - 1 : min(Int(last) ?? total - 1, total - 1)
    guard upper >= lower else { return nil }
    return (lower, upper)
  }

  func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}

  private func fail(_ task: WKURLSchemeTask, url: URL?) {
    let response = HTTPURLResponse(url: url ?? URL(string: "\(appScheme)://\(appHost)/")!,
                                   statusCode: 404, httpVersion: "HTTP/1.1", headerFields: nil)!
    task.didReceive(response)
    task.didReceive(Data())
    task.didFinish()
  }
}
