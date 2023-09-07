import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Database } from "../../../utils/database.types";

interface PostCardProps {
    planetImage: string;
    time: string;
    user: string;
    planet: string;
    // comment: string;
}

const PostCard: React.FC<PostCardProps> = ({
    planetImage,
    time,
    user,
    planet,
    // comment
}) => {
    const postCardRef = useRef<HTMLDivElement>(null);

    const handleShareClick = () => {
        if (postCardRef.current) {
            html2canvas(postCardRef.current).then(canvas => {
                // Convert the canvas to a data URL
                const imageUrl = canvas.toDataURL("image/png");

                // Create an anchor element to trigger the download
                const a = document.createElement("a");
                a.href = imageUrl;
                a.download = "post_card.png";
                a.click();
            });
        }
    };

    return (
        <div className="flex flex-col max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-lg">
            <div ref={postCardRef} className="relative">
                <img className="object-cover w-full h-48" src={planetImage} alt="Planet's image" />
                <div className="absolute inset-0 flex items-end justify-between p-4">
                    <div>
                        <p className="text-sm font-medium text-white">{time}</p>
                        <p className="text-sm font-medium text-white">{user}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{planet}</p>
                    </div>
                </div>
            </div>
            {/* <div className="flex flex-col justify-between flex-1 p-4">
                {/* <p className="text-sm">{comment}</p>
            </div> */}
        </div>
    );
};

export default PostCard;

interface PostCardProps {
    planetImage: string; // Import this from database types
    time: string;
    user: string;
    planet: string;
  //   comment: string;
  }
  
  const PostCardUserContent: React.FC<PostCardProps> = ({
    planetImage,
    time,
    user,
    planet,
    // comment
  }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
      username: user,
      currentDate: new Date().toLocaleDateString(),
      planetName: planet,
      imageUrl: planetImage,
      userMessage: ""
    });
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
    };
  
    const handleUserMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData({
        ...formData,
        userMessage: e.target.value
      });
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // You can handle the form submission here, for example, send the data to a server
      console.log(formData);
      // Reset the form and hide it
      setFormData({
        username: user,
        currentDate: new Date().toLocaleDateString(),
        planetName: planet,
        imageUrl: planetImage,
        userMessage: ""
      });
      setShowForm(false);
    };
  
    const handleShareButtonClick = () => {
      // Capture the screenshot of the component
      html2canvas(document.getElementById("post-card-container")).then(function (canvas) {
        // Create a Blob from the canvas data
        canvas.toBlob(function (blob) {
          // Create a URL for the Blob
          const imageUrl = window.URL.createObjectURL(blob);
    
          // Create an anchor element for downloading the image
          const a = document.createElement("a");
          a.href = imageUrl;
          a.download = "post_card_image.png"; // Specify the file name here
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      });
    };  
  
    return (
      <div className="flex flex-col max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-lg" id="post-card-container">
        {showForm ? (
          <form onSubmit={handleSubmit}>
            <div className="p-4">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="mb-2 w-full border rounded-lg px-3 py-2"
                placeholder="Username"
                readOnly
              />
              <input
                type="text"
                name="currentDate"
                value={formData.currentDate}
                onChange={handleInputChange}
                className="mb-2 w-full border rounded-lg px-3 py-2"
                placeholder="Date"
                readOnly
              />
              <input
                type="text"
                name="planetName"
                value={formData.planetName}
                onChange={handleInputChange}
                className="mb-2 w-full border rounded-lg px-3 py-2"
                placeholder="Planet Name"
                readOnly
              />
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="mb-2 w-full border rounded-lg px-3 py-2"
                placeholder="Image URL"
                readOnly
              />
              <textarea
                name="userMessage"
                value={formData.userMessage}
                onChange={handleUserMessageChange}
                className="mb-2 w-full border rounded-lg px-3 py-2"
                placeholder="Your Message"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg"
                onClick={handleShareButtonClick}
              >
                Share
              </button>
            </div>
          </form>
        ) : (
          <div className="relative">
            <img
              className="object-cover w-full h-48"
              src={planetImage}
              alt="Planet's image"
            />
            <div className="absolute inset-0 flex items-end justify-between p-4">
              <div>
                <p className="text-sm font-medium text-white">{time}</p>
                <p className="text-sm font-medium text-white">{user}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{planet}</p>
              </div>
            </div>
          </div>
        )}
        {showForm ? null : (
          <div className="flex flex-col justify-between flex-1 p-4">
            {/* <p className="text-sm">{comment}</p> */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-lg"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };