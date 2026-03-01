type SectionHeaderProps = {
  blackText: string;
  greenText: string;
};

export default function SectionHeader({
  blackText,
  greenText,
}: SectionHeaderProps) {
  return (
    <h2 className="py-4 text-center text-2xl font-extrabold uppercase md:text-3xl">
      <span className="text-black">{blackText} </span>
      <span className="text-green-600">{greenText}</span>
    </h2>
  );
}
