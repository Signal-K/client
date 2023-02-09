export default function UserCoverImage ( { url, editable } ) {
    return (
        <div className="h-60 overflow-hidden flex justify-center items-center relative">
            <div><img src={url} alt="User's cover image"/></div>
            {editable && (
                <div className="absolute right-0 bottom-0 m-2"><button className="bg-white py-1 px-4 rounded-md">Change cover image</button></div>
            )}
        </div>
    );
}