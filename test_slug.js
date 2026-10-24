const str = "Vaayu Yantra YK Star, Crop Growth Promoter & Controls Black Thrips - (1L+1L+1L)";
const cleanName = str
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-")     // spaces to hyphens
    .toLowerCase();
console.log(cleanName);
