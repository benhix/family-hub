// app/account-setup/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, User, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function AccountSetupContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    firstName: (user?.unsafeMetadata?.firstName as string) || '',
    lastName: (user?.unsafeMetadata?.lastName as string) || '',
    nickname: (user?.unsafeMetadata?.nickname as string) || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.imageUrl || null);

  // Check if this is an editing session (user came here via "Edit Profile" button)
  const isEditing = searchParams.get('edit') === 'true';

  // Check if profile is already complete and redirect if so
  useEffect(() => {
    if (isLoaded && user) {
      const profileComplete = user.unsafeMetadata?.profileComplete;
      const hasFirstName = user.unsafeMetadata?.firstName;
      const hasLastName = user.unsafeMetadata?.lastName;

      console.log('Account Setup Debug:', {
        profileComplete,
        hasFirstName,
        hasLastName,
        isEditing,
        unsafeMetadata: user.unsafeMetadata
      });

      // Only redirect if user has complete profile AND they're not here to edit
      const hasCompleteProfile = profileComplete && hasFirstName && hasLastName;
      
      if (hasCompleteProfile && !isEditing) {
        console.log('Profile is complete and not editing, redirecting to home...');
        router.push('/');
        return;
      }

      // Update form data when user loads (for both new and existing users)
      setFormData({
        firstName: (hasFirstName as string) || '',
        lastName: (hasLastName as string) || '',
        nickname: (user.unsafeMetadata?.nickname as string) || '',
      });
      
      setPreviewUrl(user.imageUrl || null);
    }
  }, [isLoaded, user, router, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For new users, a new profile image file is mandatory.
    // For existing users, they must have an existing image URL or upload a new file.
    if (!profileImage && (isNewUser || !user?.imageUrl)) {
        toast.error('A profile image is required to continue.');
        return;
    }
    
    setIsLoading(true);

    try {
      // Store all profile information in unsafeMetadata
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          firstName: formData.firstName,
          lastName: formData.lastName,
          nickname: formData.nickname,
          profileComplete: true
        }
      });

      // Upload profile image if provided
      if (profileImage) {
        await user?.setProfileImage({ file: profileImage });
      }

      // Show success state
      setIsSuccess(true);

      // Small delay to ensure Clerk updates propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to home page
      router.push('/');
      
      // Fallback: force reload if router doesn't work
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('There was an error updating your profile. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show success screen while redirecting
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Profile Complete!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Welcome to your family dashboard
              </p>
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  Redirecting to dashboard...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking auth state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Checking profile status...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine if this is a new user or existing user editing
  const isNewUser = !isEditing && (!user?.unsafeMetadata?.profileComplete && !user?.unsafeMetadata?.firstName && !user?.unsafeMetadata?.lastName);
  const pageTitle = isNewUser ? "Complete Your Profile" : "Edit Your Profile";
  const pageSubtitle = isNewUser ? "Let's set up your family dashboard profile" : "Update your profile information";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {pageTitle}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {pageSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={32} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                    <Camera size={16} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Click the camera to upload a photo <span className="text-red-500">*</span>
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                {/* Nickname */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nickname
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What should we call you?"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    isNewUser ? 'Complete Setup' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <AccountSetupContent />
    </Suspense>
  );
}