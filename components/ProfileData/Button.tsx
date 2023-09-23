import clsx from 'clsx';
import { memo } from 'react';

interface ButtonTypes {
    label?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    padding?: 'sm' | 'md'
    outline?: boolean
}

const ProfileButton = ({ label, size, padding, outline }: ButtonTypes) => {
    return (
        <button
            className={clsx(
                'py-[7px] mr-4 font-medium delay-75 transition ease-in-out rounded-lg',
                padding === 'sm' ? 'px-3' : padding === 'md' ? 'px-8' : '',
                outline === true
                    ? 'border-2 border-slate-900 bg-white outline-none text-slate-900 hover:bg-slate-50'
                    : 'border-2 border-slate-900 bg-slate-900 outline-none text-slate-100 hover:bg-black',
                size === 'xs'
                    ? 'text-xs'
                    : size === 'sm'
                    ? 'text-sm'
                    : size === 'md'
                    ? 'text-md'
                    : size === 'lg'
                    ? 'text-lg'
                    : size === 'xl'
                    ? 'text-xl'
                    : 'text-md'
            )}
        >
        {label}
      </button>
    );
};
  
export default memo(ProfileButton);