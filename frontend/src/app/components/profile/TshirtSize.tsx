import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";

const sizes = [
  "Select T-Shirt Size",
  "Mens XS",
  "Mens S",
  "Mens M",
  "Mens L",
  "Mens XL",
  "Mens 2XL",
  "Mens 3XL",
  "Mens 4XL",
  "Ladies S",
  "Ladies M",
  "Ladies L",
  "Ladies XL",
  "Ladies 2XL",
  "Ladies 3XL",
];

interface TshirtProps {
  tshirtSize: string | null;
  setTshirtSize: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const TshirtSize = ({ tshirtSize, setTshirtSize }: TshirtProps) => {
  return (
    <>
      <div className={profileStyles.content}>
        <p className={pageStyles.bold}>T-Shirt Size</p>
        <select
          value={tshirtSize ?? "Select T-Shirt Size"}
          onChange={setTshirtSize}
        >
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <hr className={pageStyles.divider} />
    </>
  );
};
