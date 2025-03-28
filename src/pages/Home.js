import FileUpload from "../components/FileUpload";

const Home = ({ history }) => {
  return (
    <div>
        <FileUpload history={history} />
    </div>
  )
}

export default Home;