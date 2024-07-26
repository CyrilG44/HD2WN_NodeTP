module.exports = {
    //function(){} OU () => {}

    //reponse json au format
    responseService: function(response,code,message,data){
        response.json({code: code,message: message, data: data});
    }
}