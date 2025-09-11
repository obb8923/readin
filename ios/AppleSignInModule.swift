import Foundation
import AuthenticationServices
import React

@objc(AppleSignInModule)
class AppleSignInModule: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
  private var resolve: RCTPromiseResolveBlock?
  private var reject: RCTPromiseRejectBlock?

  // RN 모듈 초기화를 메인 큐에서 보장
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc(signInWithApple:rejecter:)
  func signInWithApple(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    self.resolve = resolve
    self.reject = reject

    DispatchQueue.main.async {
      let request = ASAuthorizationAppleIDProvider().createRequest()
      request.requestedScopes = [.email, .fullName]

      let controller = ASAuthorizationController(authorizationRequests: [request])
      controller.delegate = self
      controller.presentationContextProvider = self
      controller.performRequests()
    }
  }

  func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
    if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
       let identityToken = appleIDCredential.identityToken,
       let tokenString = String(data: identityToken, encoding: .utf8) {
      resolve?(["idToken": tokenString])
    } else {
      reject?("NO_TOKEN", "Unable to fetch identity token", nil)
    }
  }

  func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
    reject?("APPLE_SIGNIN_ERROR", error.localizedDescription, error)
  }

  // MARK: - ASAuthorizationControllerPresentationContextProviding
  func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
    if let topVC = RCTPresentedViewController(), let window = topVC.view.window {
      return window
    }
    if let windowScene = UIApplication.shared.connectedScenes
      .compactMap({ $0 as? UIWindowScene })
      .first(where: { $0.activationState == .foregroundActive }),
       let window = windowScene.windows.first(where: { $0.isKeyWindow }) {
      return window
    }
    return ASPresentationAnchor()
  }
} 