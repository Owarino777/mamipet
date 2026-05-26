type AuthBackButtonProps = {
  label?: string;
  onClick: () => void;
};

export function AuthBackButton({ label = "Retour", onClick }: AuthBackButtonProps) {
  return (
    <button className="auth-back-button" onClick={onClick} type="button">
      <span>{label}</span>
    </button>
  );
}
