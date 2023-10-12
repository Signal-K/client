import React, { useState, useEffect } from "react";
import CoreLayout from "../../../components/Core/Layout";
import RoverImagePage from "../../../components/Gameplay/Planets/RoverData/RandomImage";

// Define the TypeScript types for product data
interface ProductData {
  Product: string;
  Platform: string;
  Description: string;
  RasterType: string;
  Resolution: string;
  TemporalGranularity: string;
  Version: string;
  Available: boolean;
  DocLink: string;
  Source: string;
  TemporalExtentStart: Date;
  TemporalExtentEnd: Date;
  Deleted: boolean;
  DOI: string;
  Info: any; // Define Info type accordingly
  ProductAndVersion: string;
}

const Product = () => {
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading
  const [selectedProduct, setSelectedProduct] = useState<string>(""); // Selected product

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/product"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setProductData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setIsLoading(false); // Set loading to false on error
      }
    };

    fetchData();
  }, []);

  const handleProductChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedProduct(selectedValue);
  };

  return (
    <CoreLayout>
        {/* <div>
        <form>
            <label>Select a Product:</label>
            <select onChange={handleProductChange} value={selectedProduct}>
            <option value="">Select a product</option>
            {productData.map((product, index) => (
                <option key={index} value={product.Product}>
                {product.Product}
                </option>
            ))}
            </select>
        </form>
        {isLoading ? (
            <p>Loading...</p>
        ) : (
            <ul>
            {productData
                .filter((product) =>
                selectedProduct ? product.Product === selectedProduct : true
                )
                .map((product, index) => (
                <li key={index}>
                    <p>Product: {product.Product}</p>
                    <p>Platform: {product.Platform}</p>
                    <p>Description: {product.Description}</p>
                </li>
                ))}
            </ul>
        )}
        </div> */}
        <RoverImagePage />
    </CoreLayout>
  );
};

export default Product;