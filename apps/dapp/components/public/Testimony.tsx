import Image from 'next/image';

export interface ITestimony {
  name: string;
  pictureSrc?: string;
  job?: string;
  testimony: string;
}

export const Testimony: React.FC<ITestimony> = ({
  name,
  pictureSrc,
  job,
  testimony,
}) => {
  return (
    <div className={`c-testimony`}>
      <div className={`u-quote`}>
        <p>{testimony}</p>
      </div>
      <div className={`c-testimony__author`}>
        <Image
          alt=""
          className={`c-testimony__image`}
          src={pictureSrc}
          width={64}
          height={64}
        />
        <div>
          <p className={`name`}>{name}</p>
          <p className={`firm`}>{job}</p>
        </div>
      </div>
    </div>
  );
};

Testimony.displayName = 'Testimony';
