import React, { useRef, useState } from "react";
import {
  Camera,
  LoaderCircle,
  X,
  Trash2,
} from "lucide-react";

import {
  uploadAvatar,
  removeAvatar,
} from "../../config/api";

import { useToast } from "../../context/ToastContext";

export default function ProfileAvatar({
  user,
  onAvatarUpdated,
  size = "large",
}) {
  const fileInputRef = useRef(null);

  const { showToast } = useToast();

  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

 
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast(
        "Please select a JPG, PNG, or WebP image"
      );

      e.target.value = "";
      return;
    }

   
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be smaller than 5 MB");

      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setShowPicker(false);

      const data = await uploadAvatar(
        user._id,
        file
      );

      
      onAvatarUpdated(data.avatar);

      showToast(
        "Profile photo updated successfully ♡"
      );
    } catch (err) {
      console.error(
        "Avatar upload failed:",
        err
      );

      showToast(
        err.message ||
          "Failed to update profile photo"
      );
    } finally {
      setUploading(false);

      // Allow selecting the same image again
      e.target.value = "";
    }
  };

 
  const openChangePhoto = () => {
    if (uploading) return;

    setShowPicker(false);

    fileInputRef.current?.click();
  };

 
  const handleRemovePhoto = async () => {
    if (uploading) return;

    try {
      setUploading(true);
      setShowPicker(false);

      const data = await removeAvatar(
        user._id
      );

      // data.avatar will be ""
      onAvatarUpdated(data.avatar);

      showToast(
        "Profile photo removed successfully ♡"
      );
    } catch (err) {
      console.error(
        "Avatar removal failed:",
        err
      );

      showToast(
        err.message ||
          "Failed to remove profile photo"
      );
    } finally {
      setUploading(false);
    }
  };

  
  const openChangePhotoMenu = () => {
    if (uploading) return;

    setShowPicker(true);
  };

  return (
    <>
    
      <div
        className={`profile-avatar-wrapper ${size}`}
      >
        <div className="profile-avatar">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.username
                ?.charAt(0)
                .toUpperCase()}
            </div>
          )}

          
          {uploading && (
            <div className="profile-avatar-loading">
              <LoaderCircle
                size={28}
                className="avatar-spinner"
              />
            </div>
          )}
        </div>

       
        <button
          type="button"
          className="change-avatar-btn"
          onClick={openChangePhotoMenu}
          disabled={uploading}
          aria-label="Change profile photo"
        >
          {uploading ? (
            <LoaderCircle
              size={17}
              className="avatar-spinner"
            />
          ) : (
            <Camera size={19} />
          )}
        </button>

        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFileChange}
          hidden
        />
      </div>

     
      {showPicker && (
        <div
          className="avatar-picker-overlay"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="avatar-picker"
            onClick={(e) => e.stopPropagation()}
          >
            
            <button
              type="button"
              className="avatar-picker-close"
              onClick={() => setShowPicker(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

           
            <div className="avatar-picker-header">
              <div className="avatar-picker-icon">
                <Camera size={22} />
              </div>

              <div>
                <h3>
                  Change Profile Photo
                </h3>

                <p>
                  Choose how you want to update
                  your photo
                </p>
              </div>
            </div>

           
            <div className="avatar-picker-options">

              
              <button
                type="button"
                onClick={openChangePhoto}
              >
                <span className="picker-option-icon">
                  <Camera size={21} />
                </span>

                <span>
                  <strong>
                    Change Photo
                  </strong>

                  <small>
                    Choose or take a new photo
                  </small>
                </span>
              </button>

              
              {user.avatar && (
                <button
                  type="button"
                  className="remove-avatar-option"
                  onClick={handleRemovePhoto}
                >
                  <span className="picker-option-icon">
                    <Trash2 size={21} />
                  </span>

                  <span>
                    <strong>
                      Remove Photo
                    </strong>

                    <small>
                      Remove your current
                      profile picture
                    </small>
                  </span>
                </button>
              )}
            </div>

        
            <button
              type="button"
              className="avatar-picker-cancel"
              onClick={() =>
                setShowPicker(false)
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
