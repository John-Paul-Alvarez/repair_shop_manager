function Icon({ name, className = "" }) {
  return (
    <img
      src={`/icons/${name}.svg`}
      alt=""
      aria-hidden="true"
      width="20"
      height="20"
      className={`icon ${className}`}
    />
  );
}
export { Icon as default };
