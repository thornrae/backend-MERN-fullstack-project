class HttpError extends Error {
  constructor(message, errorCode){
    //super to call constructor of base class in this case, error
    super(message); //adds a "message" property to instance
    this.code = errorCode //adds "code property"
  }

}

module.exports = HttpError;

//based on built in error but can tweak it 
