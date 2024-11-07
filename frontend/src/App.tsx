import CelebrityRecognition from "./components/CelebrityRecognition";
import ImagesList from "./components/ImagesList";
import PhotoUploader from "./components/PhotoUploader";

function App() {
    return (
        <div>
            <PhotoUploader />
            <ImagesList />
            <CelebrityRecognition />
        </div>
    );
}

export default App;
