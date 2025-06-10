import logo from "@/assets/logo.svg";

export function Logo() {
  return (
    <div className="flex flex-col items-center gap-2 font-medium w-full">
      <img src={logo} alt="Logo COFRAP" className="w-40" />
    </div>
  );
}
