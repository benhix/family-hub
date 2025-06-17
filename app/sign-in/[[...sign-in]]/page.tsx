import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="relative z-10">
          <SignIn 
            signUpUrl="/sign-up"
            afterSignInUrl="/"
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: '#2563eb',
                colorBackground: '#ffffff',
                colorInputBackground: '#f8fafc',
                colorInputText: '#1e293b',
                colorText: '#1e293b',
                colorTextSecondary: '#64748b',
                colorNeutral: '#f1f5f9',
                borderRadius: '0.75rem',
              },
              elements: {
                rootBox: "mx-auto",
                card: "bg-white dark:bg-slate-800 shadow-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl",
                headerTitle: "text-xl font-bold text-gray-900 dark:text-white",
                headerSubtitle: "text-gray-600 dark:text-gray-400",
                socialButtonsBlockButton: "bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600",
                socialButtonsBlockButtonText: "text-gray-700 dark:text-gray-200 font-medium",
                dividerLine: "bg-gray-200 dark:bg-gray-600",
                dividerText: "text-gray-500 dark:text-gray-400",
                formFieldLabel: "text-gray-700 dark:text-gray-300 font-medium",
                formFieldInput: "bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors",
                formButtonSecondary: "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                footerActionLink: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
                identityPreviewText: "text-gray-700 dark:text-gray-300",
                identityPreviewEditButton: "text-blue-600 dark:text-blue-400",
                formResendCodeLink: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
                otpCodeFieldInput: "bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white",
                alertText: "text-red-600 dark:text-red-400",
                formFieldErrorText: "text-red-600 dark:text-red-400",
                formFieldSuccessText: "text-green-600 dark:text-green-400",
                formFieldWarningText: "text-yellow-600 dark:text-yellow-400",
                footerAction__signUp: "hidden",
              }
            }}
          />
        </div>
      </div>
    </div>
  )
} 