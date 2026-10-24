async function test() {
    // Test 1: GetAllCategoryWiseProductsBasedOnProductName with exact name
    const fd1 = new URLSearchParams();
    fd1.append("ProductName", "Vaayu Yantra YK Star, Crop Growth Promoter & Controls Black Thrips - (1L+1L+1L)");
    const res1 = await fetch("https://ykmart.in/webservices/api/Products/GetAllCategoryWiseProductsBasedOnProductName", {
        method: "POST",
        body: fd1
    });
    const d1 = await res1.json();
    console.log("Test 1 (Exact length):", d1.length);

    // Test 2: Search with just "vaayu yantra"
    const fd2 = new URLSearchParams();
    fd2.append("productName", JSON.stringify([{ productname: "vaayu" }]));
    const res2 = await fetch("https://ykmart.in/webservices/api/Products/GetAll_SearchingProducts", {
        method: "POST",
        body: fd2
    });
    const d2 = await res2.json();
    console.log("Test 2 (Search vaayu length):", d2.length);
}

test();
