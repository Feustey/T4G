import { SizeType } from 'apps/dapp/types';
import Image from 'next/image';
import { ButtonIcon } from '../shared/Button-icon';
import { useRef } from 'react';
import React from 'react';
import { useLanguage } from 'apps/dapp/hooks';

export interface IAvatar {
  id: string;
  avatar?: string;
  firstname: string;
  lastname: string;
  size?: SizeType;
  isEditable?: boolean;
  handleFileUpload?: (file: File) => void;
  isLoading: boolean;
  isDisplayingName?: boolean;
  canDelete?: boolean;
  classNameCss?: string;
}

export const Avatar: React.FC<IAvatar> = ({
  id,
  avatar,
  size,
  isEditable = false,
  lastname,
  firstname,
  handleFileUpload,
  isLoading,
  isDisplayingName = false,
  canDelete,
  classNameCss,
}) => {
  const lang = useLanguage();

  let realSize: number;
  switch (size) {
    case 'xs':
      realSize = 40;
      break;
    case 'sm':
      realSize = 64;
      break;
    case 'md':
      realSize = 96;
      break;
    case 'lg':
      realSize = 128;
      break;

    default:
      realSize = 96;
      break;
  }
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      {!isEditable &&
        (avatar ? (
          <div
            className={`c-avatar__thumbnail-avatar ${classNameCss}`}
            style={{ '--size': `${realSize}px` } as React.CSSProperties}
          >
            <Image
              src={avatar}
              alt={`Image ${firstname} ${lastname}`}
              width={realSize}
              height={realSize}
            />
          </div>
        ) : (
          <span
            style={{ '--size': `${realSize}px` } as React.CSSProperties}
            className={`c-avatar__thumbnail-avatar--placeholder ${classNameCss}`}
          >
            {firstname?.charAt(0)}
            {lastname?.charAt(0)}
          </span>
        ))}
      {isEditable && (
        <div className="c-avatar-edit-form">
          {avatar && !isLoading && (
            <div
              className="c-avatar__thumbnail-avatar"
              style={{ '--size': `${realSize}px` } as React.CSSProperties}
            >
              <Image
                src={avatar}
                alt={`Image ${firstname} ${lastname}`}
                width={realSize}
                height={realSize}
                onClick={() => inputRef.current?.click()}
              />
            </div>
          )}

          {!avatar && (
            <span
              style={{ '--size': `${realSize}px` } as React.CSSProperties}
              className="c-avatar__thumbnail-avatar--placeholder"
              onClick={() => inputRef.current?.click()}
            >
              {firstname.charAt(0)}
              {lastname.charAt(0)}
            </span>
          )}
          <label htmlFor={id}>
            <span className="u-sr-only">{lang.components.avatar.import}</span>{' '}
            <ButtonIcon
              onClick={() => inputRef.current?.click()}
              iconName={'camera'}
            />{' '}
          </label>
          <input
            id={id}
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          {canDelete && (
            <button type="button" className="c-avatar--remove">
              {lang.utils.delete}
            </button>
          )}
        </div>
      )}
      {isDisplayingName && (
        <p className="heading-4 u-margin--none">
          {firstname} {lastname}
        </p>
      )}
    </>
  );
};

Avatar.displayName = 'Avatar';
