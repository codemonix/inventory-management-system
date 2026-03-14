import logger from "./logger.js";


const getSortOptions = ( sortParam ) => {
    const sortOptions ={};
    const sortField = sortParam.split('_')[0];
    const sortOrder = sortParam.split('_')[1] === 'desc' ? -1 : 1 ;
    sortOptions[sortField] = sortOrder;
    logger.info("getSortOptions.js -> sortOptions called");
    return sortOptions;
};

export default getSortOptions
