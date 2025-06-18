


// const sortOptions = {};
//         if (req.query.sort) {
//             const sortField = req.query.sort.split('_')[0];
//             const sortOrder = req.query.sort.split('_')[1] === 'desc' ? -1 : 1;
//             sortOptions[sortField] = sortOrder;
//         }


const getSortOptions = ( sortParam ) => {
    const sortOptions ={};
    const sortField = sortParam.split('_')[0];
    const sortOrder = sortParam.split('_')[1] === 'desc' ? -1 : 1 ;
    sortOptions[sortField] = sortOrder;
    return sortOptions;
};

export default getSortOptions
