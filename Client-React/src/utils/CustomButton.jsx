export const CustomButton = ({
  text,
  bgColor,
  color,
  fontSize,
  borderRadius,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "16px 0",
        backgroundColor: bgColor,
        borderRadius: borderRadius,
        border: "none",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          color: color,
          fontSize: fontSize,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {text}
      </span>
    </button>
  );
};
