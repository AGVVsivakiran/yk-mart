async function testSlugMatching() {
    const searchSlug = "vaayu-yantra-yk-star-crop-growth-promoter-controls-black-thrips---1l1l1l";

    const allFormData = new URLSearchParams();
    allFormData.append('productName', JSON.stringify([{ productname: "" }]));
    
    // We must hit the live API or local? The React app uses baseUrl from Variables.json
    // Let's use https://ykmart.in/webservices as the API base
    const allRes = await fetch("https://ykmart.in/webservices/api/Products/GetAll_SearchingProducts", {
      method: "POST", body: allFormData
    });
    
    const allProducts = await allRes.json();
    console.log("Total products fetched:", allProducts.length);
    
    // Let's test the matching logic
    const foundProduct = allProducts.find(p => {
        const productSlug = p.productname
          .trim()
          .replace(/[^\w\s-]/g, "") // remove special chars
          .replace(/\s+/g, "-")     // spaces to hyphens
          .toLowerCase();
        
        // Debug exactly what the slug translates to
        if (p.productname.toLowerCase().includes("vaayu")) {
            console.log("Candidate:", p.productname);
            console.log("Generated slug:", productSlug);
        }

        return productSlug === searchSlug;
    });

    if (foundProduct) {
        console.log("SUCCESS! Found product:", foundProduct.productname);
    } else {
        console.log("FAILED to find product with slug:", searchSlug);
    }
}

testSlugMatching();
