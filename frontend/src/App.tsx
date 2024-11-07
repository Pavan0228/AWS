import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CelebrityRecognition from "./components/CelebrityRecognition";
import ImagesList from "./components/ImagesList";
import PhotoUploader from "./components/PhotoUploader";

function App() {
    return (
        <Router>
            <div className="bg-gray-100 min-h-screen">
                {/* Navigation */}
                <nav className="bg-white shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    to="/"
                                    className="text-gray-900 font-bold text-xl"
                                >
                                    Image App
                                </Link>
                            </div>
                            <div>
                                <ul className="flex space-x-4">
                                    <li>
                                        <Link
                                            to="/"
                                            className="text-gray-700 hover:text-gray-900 transition-colors duration-300"
                                        >
                                            Photo Uploader
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/images-list"
                                            className="text-gray-700 hover:text-gray-900 transition-colors duration-300"
                                        >
                                            Images List
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/celebrity-recognition"
                                            className="text-gray-700 hover:text-gray-900 transition-colors duration-300"
                                        >
                                            Celebrity Recognition
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Routes */}
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<PhotoUploader />} />
                        <Route path="/images-list" element={<ImagesList />} />
                        <Route
                            path="/celebrity-recognition"
                            element={<CelebrityRecognition />}
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
