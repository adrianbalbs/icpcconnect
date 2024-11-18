import { ChangeEvent } from "react";
import styles from "@/styles/Experience.module.css";
import { preferenceInput } from "@/styles/sxStyles";
import { Box, TextField } from "@mui/material";

interface InputProps {
  label: string;
  type?: string;
  name?: string;
  placeholder: string;
  value: string;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  disabled?: boolean;
  gap?: string;
  errorMsg?: string;
}

/**
 * Modal input component
 * - helper component to render repeated input boxes
 */
const ModalInput = ({
  label,
  type,
  name,
  placeholder,
  value,
  handleChange,
  disabled,
  gap,
  errorMsg,
}: InputProps) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "4fr 5fr",
        alignItems: "center",
        justifyContent: "center",
        columnGap: "32px",
        mb: gap ?? 0,
      }}
    >
      <p className={styles.language}>{label}</p>
      <TextField
        name={name}
        type={type ?? "text"}
        placeholder={placeholder}
        value={value}
        sx={preferenceInput(type === "password")}
        onChange={handleChange}
        disabled={disabled ?? false}
        error={!!errorMsg}
        helperText={errorMsg}
      />
    </Box>
  );
};

export default ModalInput;
