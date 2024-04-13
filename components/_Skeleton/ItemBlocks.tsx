import { useEffect } from "react";
import axios from "axios";

export const ItemListFromFlaskBlock = () => {
    useEffect(() => {
        const fetchItems = async () => {
          try {
            const response = await axios.get('http://127.0.0.1:5000/items');
            console.log('Items:', response.data);
          } catch (error) {
            console.error('Error fetching items:', error.message);
          }
        };
    
        fetchItems();
      }, []);
    
      return (
        <div>
          Fetching items...
        </div>
      );
};