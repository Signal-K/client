import { useState } from 'react';
import { supabase } from '../../../utils/discussion/supabaseClient';
import Avatar from './Avatar';

interface AvatarFormProps {
  username: string;
  avatar_url: string | null;
  onUpload: (filePath: string) => void;
}

export default function AvatarForm({ username, avatar_url, onUpload }: AvatarFormProps) {
  const [uploading, setUploading] = useState(false);

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Size validation
      let fileSize = file.size / 1024 / 1024;
        fileSize = parseFloat(fileSize.toFixed(2)); // Parse the string back to a number
        console.log(fileSize);
      console.log(fileSize);
      if (fileSize > 2) {
        alert('Too big, the maximum is 2MiB. Your file size is: ' + fileSize + ' MiB');
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="field">
        <label className="label">Avatar</label>
        <Avatar username={username} avatar_url={avatar_url} />
      </div>

      <div>
        <label className="button is-small primary block" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  );
}