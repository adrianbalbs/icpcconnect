"use client";
import pageStyles from "@/styles/Page.module.css";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  description: string;
  buttonText: string;
  buttonTo: string;
  added: boolean;
}

/**
 * Tile component
 * - renders options that students should complete before contest registration
 */
const Tile: React.FC<Props> = ({
  title,
  description,
  buttonText,
  buttonTo,
  added,
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(buttonTo);
  };

  return (
    <div className={pageStyles.tile}>
      <h2 className={pageStyles["tile-title"]}>{title}</h2>
      <div className={pageStyles["tile-description"]}>
        <p>{description}</p>
      </div>
      <div className={pageStyles["tile-button-container"]}>
        <a
          href={buttonTo}
          onClick={handleClick}
          className={`${pageStyles["tile-button"]} ${added && pageStyles.added}`}
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
};

export default Tile;
