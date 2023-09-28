const Round = (props) => {
    const { battleId, display } = props;

    switch(display) {
        case 'title':
            if (battleId)
            return 'Battle ' + battleId;

            return 'New battle';
        break;
    }
    return(
        1
    )
};

export default Round;