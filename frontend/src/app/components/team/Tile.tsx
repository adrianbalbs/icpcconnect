import pageStyles from '@/styles/Page.module.css';

interface Props {
  title: string;
  description: string;
  buttonText: string;
  buttonTo: string;
}

const Tile: React.FC<Props> = ({ title, description, buttonText, buttonTo }) => {
  return (
    <div className={pageStyles.tile}>
      <div className={pageStyles['tile-title']}>
        <h2>{title}</h2>
      </div>
      <div className={pageStyles['tile-description']}>
        <p>{description}</p>
      </div>
      <div className={pageStyles['tile-button-container']}>
        <a href={buttonTo} className={pageStyles['tile-button']}>{buttonText}</a>
      </div>
    </div>
  );
}

export default Tile;