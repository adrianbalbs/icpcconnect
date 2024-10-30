import pageStyles from '@/styles/Page.module.css';

interface Props {
  title: string;
  description: string;
  buttonText: string;
  buttonTo: string;
  added: boolean;
  setAdded?: () => void;
}

const Tile: React.FC<Props> = ({ title, description, buttonText, buttonTo, added, setAdded }) => {
  return (
    <div className={pageStyles.tile}>
      <h2 className={pageStyles['tile-title']}>{title}</h2>
      <div className={pageStyles['tile-description']}>
        <p>{description}</p>
      </div>
      <div className={pageStyles['tile-button-container']}>
        <a 
          href={buttonTo} 
          onClick={setAdded}
          className={`${pageStyles['tile-button']} ${added && pageStyles.added}`}
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

export default Tile;