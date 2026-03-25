export function floorFromRoom(room: string) {
  const num = parseInt(room.replace(/\D/g, ""), 10);

  if (isNaN(num)) return "Floor 2";
  if (num < 100) return "Basement";
  if (num < 200) return "Floor 1";
  if (num < 300) return "Floor 2";
  if (num < 400) return "Floor 3";
  if (num < 500) return "Floor 4";
  return "Floor 5";
}

