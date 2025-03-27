import UploadAudio from '../components/UploadAudio';

const Home = ({ history }) => {
  return (
    <div>
        <UploadAudio history={history} />
    </div>
  )
}

export default Home;