import "./styles.css";

const ImageContainer = ({data}) => {
  return (
    <>
      <h2 class="searchHeading">Search results</h2>
      <div className="imageContainer">
     
        {((data || []).length === 0?(<h2 className="error">No results found</h2>) :(data||[]).map((val , index) => {
          let [img , caption] = val;
          return <figcaption className="image">
          <img
            alt="asdasd"
            src={img}
          />
          <caption>{caption}</caption>
        </figcaption>
        }) )}
        
        
       
      </div>
    </>
  );
};

export default ImageContainer;
