module.exports = func => {
    return (req,res,next) => {
        func(req, res, next).catch(next); // catch err to next if error exists
    }
}