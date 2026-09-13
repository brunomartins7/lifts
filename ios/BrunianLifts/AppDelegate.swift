import UIKit
import WebKit

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

  override func loadView() {
    let config = WKWebViewConfiguration()
    config.setURLSchemeHandler(BundleSchemeHandler(), forURLScheme: appScheme)
    // Persistent, not ephemeral: the ledger has to survive a force-quit.
    config.websiteDataStore = .default()
    config.allowsInlineMediaPlayback = true
    config.mediaTypesRequiringUserActionForPlayback = []

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
    "gif":  "image/gif"
  ]

  func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
    guard let url = task.request.url,
          let root = Bundle.main.url(forResource: "www", withExtension: nil) else {
      return fail(task, url: task.request.url)
    }
    guard url.host == appHost else { return fail(task, url: url) }
    var rel = url.path
    if rel.isEmpty || rel == "/" { rel = "/index.html" }
    let target = root.appendingPathComponent(rel).standardizedFileURL

    // standardizedFileURL has already resolved any "..", so this comparison is
    // what stops a crafted path reading outside www/. The trailing slash matters:
    // without it a sibling directory whose name merely starts with "www" would
    // also satisfy the prefix.
    let rootPath = root.standardizedFileURL.path
    guard target.path == rootPath || target.path.hasPrefix(rootPath + "/"),
          let data = try? Data(contentsOf: target) else {
      return fail(task, url: url)
    }

    let mime = Self.types[target.pathExtension.lowercased()] ?? "application/octet-stream"
    let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1",
                                   headerFields: ["Content-Type": mime,
                                                  "Content-Length": String(data.count),
                                                  "Cache-Control": "no-store"])!
    task.didReceive(response)
    task.didReceive(data)
    task.didFinish()
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
