export default function ImageBackdrop({
  image,
  opacity = "opacity-35",
  position = "center",
}) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className={`h-full w-full object-cover ${opacity}`}
        style={{ objectPosition: position }}
      />

      <div className="absolute inset-0 bg-[#020B1F]/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020B1F] via-[#020B1F]/80 to-[#020B1F]/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020B1F]/40 via-transparent to-[#020B1F]" />
    </div>
  );
}