import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import { useAccount, useContractRead, useContractReads, useContractWrite, useNetwork, usePrepareContractWrite, useSigner, useSwitchNetwork, useWaitForTransaction } from 'wagmi';
import EternovaQuickBattlesABI from './abis/EternovaQuickBattles.abi.json';
import './Game.css';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import predator from './images/predator_w.png';
import proximus_cobra from './images/proximus_cobra_w.png';
import bounty_hunter from './images/bounty_hunter_w.png';
import battle from './images/battle_icon.png';
import battle_turn from './images/battle_turn_icon.png';
import profile_1 from './images/profile_icon_1.png';
import profile_2 from './images/profile_icon_2.png';
import profile_3 from './images/profile_icon_3.png';
import profile_4 from './images/profile_icon_4.png';
import Round from './Round';
import { Bars } from  'react-loader-spinner'
import * as sapphire from '@oasisprotocol/sapphire-paratime';
import { Contract, Wallet, ethers } from "ethers";




const Game = () => {
    const { openConnectModal } = useConnectModal();
    const [showGameModal, setShowGameModal] = useState(false);
    const handleCloseGameModal = () => setShowGameModal(false);
    const handleShowGameModal = () => setShowGameModal(true);
    const { address, pendingConnector, isConnected, isConnecting, isDisconnected, connector  } = useAccount();
    const [selectedHash, setSelectedHash] = useState(null);
    const [loading, setLoading] = useState(false);
    const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();
    const { chain } = useNetwork();
    const { data: signer } = useSigner();
    const [ predatorMaxTroops, setPredatorMaxTroops ] = useState(5)
    const [ proximusCobraMaxTroops, setProximusCobraMaxTroops ] = useState(2)
    const [ bountyHunterMaxTroops, setBountyHunterMaxTroops ] = useState(3)
    let [ roundGameId, setRoundGameId ] = useState(null);
    let [ startBattleArgs, setStartBattleArgs ] = useState({address: '0x8517CB745DA514A97fE97955CFCF229Ab83a7bF0', predatorTroops: 0, proximusTroops: 0, bountyTroops: 0})
    let gamesList = [];
    const battleDataReads = [];
    const profiles = [profile_2, profile_3, profile_4, profile_2, profile_3, profile_4, profile_2, profile_3, profile_4, profile_2, profile_3, profile_4, profile_2, profile_3, profile_4, profile_2, profile_3, profile_4]


    const { data: hashData, isError: isErrorHashData, isLoading: isLoadingHashData } = useWaitForTransaction({
        hash: selectedHash,
        onSuccess(hashData) {
            setLoading(false);
            handleCloseGameModal();
        },
        onError(e) {
            setLoading(false);
        }
    })

    const EternovaQuickBattlesContract = {
        address: process.env.REACT_APP_CONTRACT_ADDRESS,
        abi: EternovaQuickBattlesABI
    }

    const { data, isError, isSuccess, config } = useContractReads({
        contracts: [
            {
                ...EternovaQuickBattlesContract,
                functionName: 'getUserBattleData',
                args: [
                    address,
                    50,
                    0
                ]
            }
        ],
        watch: true,
        enabled: isConnected ? true : false,
        onSuccess(data) {
            console.log(data)
        },
        onError(e) {
            console.error(e)
        }
    })

    // const { data: dataRead, isError: isErrorRead, isLoading: isLoadingRead } = useContractRead({
    //     address: process.env.REACT_APP_CONTRACT_ADDRESS,
    //     abi: EternovaQuickBattlesABI,
    //     functionName: 'getPublicBattleData',
    //     args: [
    //         7
    //     ],
    //     onSuccess(data) {
    //         console.log('data:', data);
    //     }
    // })
    console.log('My address:', address);    

    const battleDataRead = {
        ...EternovaQuickBattlesContract,
        functionName: 'getPublicBattleData',
        chainId: process.env.REACT_APP_CHAIN_ID
    };

    // const { data: dataPublicBattleData, isError: isErrorPublicBattleData, isSuccess: isSuccessPublicBattleData } = useContractReads({
    //     contracts: battleDataReads,
    //     watch: true,
    //     enabled: battleDataReads ? true : false,
    //     onSuccess() {
    //         console.log('[getPublicBattleData]:', dataPublicBattleData)
    //     },
    //     onError(e) {
    //         console.error(e)
    //     }
    // })



    const { config: configBattle, error: errorBattle } = usePrepareContractWrite({
        address: process.env.REACT_APP_CONTRACT_ADDRESS,
        abi: EternovaQuickBattlesABI,
        functionName: 'startBattle',
        args: [
            startBattleArgs.address,
            [
                startBattleArgs.predatorTroops,
                startBattleArgs.proximusTroops,
                startBattleArgs.bountyTroops
            ],
            {
                gasLimit: 1300000
            }
        ],
        watch: true
    })

    const { config: configRequestBattle, error: errorRequestBattle } = usePrepareContractWrite({
        address: process.env.REACT_APP_CONTRACT_ADDRESS,
        abi: EternovaQuickBattlesABI,
        functionName: 'requestBattle',
        args: [
            parseInt(roundGameId),
            [
                startBattleArgs.predatorTroops,
                startBattleArgs.proximusTroops,
                startBattleArgs.bountyTroops
            ],
            {
                gasLimit: 1300000
            },
        ]
    })

    const { data: battleData, isLoading: isLoadingBattle, isSuccess: isSuccessBattle, write: writeBattle } = useContractWrite({...configBattle, 
        onSuccess(data) {
            setSelectedHash(data.hash);
            setLoading(true);
        },
        onError() {
            setLoading(false);
        }
    });

    const { data: requestBattleData, isLoading: isLoadingRequestBattle, isSuccess: usSuccessRequestBattle, write: writeRequestBattle } = useContractWrite({...configRequestBattle, 
        onSuccess(data) {
            setSelectedHash(data.hash);
            setLoading(true);
        },
        onError() {
            setLoading(false);
        }
    });

    function startNewBattle() {
        clearRoundData();
        setRoundGameId(null);
        handleShowGameModal();
    }

    function playRound(gameId) {
        clearRoundData();
        setRoundGameId(gameId);
        handleShowGameModal();
    }

    function clearRoundData() {
        setStartBattleArgs({predatorTroops: 0, proximusTroops: 0, bountyTroops: 0})
    }

    const handleChangeAddress = (e) => {
        setStartBattleArgs({address: e.target.value, predatorTroops: startBattleArgs.predatorTroops, proximusTroops: startBattleArgs.proximusTroops, bountyTroops: startBattleArgs.bountyTroops})
    }

    const handleChangeTroops = (e) => {
        switch(e.target.attributes.name.value) {
            case 'predator':
                setStartBattleArgs({address: startBattleArgs.address, predatorTroops: Number(e.target.value), proximusTroops: startBattleArgs.proximusTroops, bountyTroops: startBattleArgs.bountyTroops})
            break;
            case 'proximus':
                setStartBattleArgs({address: startBattleArgs.address, proximusTroops: Number(e.target.value), predatorTroops: startBattleArgs.predatorTroops, bountyTroops: startBattleArgs.bountyTroops})
            break;
            case 'bounty':
                setStartBattleArgs({address: startBattleArgs.address, bountyTroops: Number(e.target.value), predatorTroops: startBattleArgs.predatorTroops, proximusTroops: startBattleArgs.proximusTroops})
            break;
        }
        console.warn(configRequestBattle);
    }


    if (isDisconnected)
    return (
        <div className='connect-container'>
            <Button onClick={openConnectModal}>Connect wallet</Button>
        </div>
    )

    if (isConnected) {
        console.log(connector)
        // console.log('signer', signer);
        const ethersSigner = sapphire
            .wrap(signer)
            .connect(ethers.getDefaultProvider(sapphire.NETWORKS.testnet.defaultGateway))

        // const contract = new Contract(process.env.REACT_APP_CONTRACT_ADDRESS, EternovaQuickBattlesABI, ethersSigner);

        // if (contract && ethersSigner) {
        //     contract.getPublicBattleData(7).then(
        //         (data) => {
        //             console.log('getPublicBattleData:', data);
        //         }
        //     )
        // }

        if(chain?.id != process.env.REACT_APP_CHAIN_ID) {
            return (
                <Button onClick={() => switchNetwork?.(parseInt(process.env.REACT_APP_CHAIN_ID))}>CHANGE NETWORK</Button>
            )
        } else {
            if (data) {
                gamesList = data?.[0];

                if (gamesList)
                for (const game of gamesList) {
                    battleDataReads.push({
                        ...battleDataRead, args: [
                            parseInt(game.battleId)
                        ]
                    });
                }
            }

            return (
                <><div className={loading ? 'loading-container' : 'hidden'}>
                    <Bars
                        height = "80"
                        width = "80"
                        radius = "9"
                        color = '#FF0099'
                        ariaLabel = 'three-dots-loading'     
                        wrapperStyle
                        wrapperClass
                    />
                </div>
                <div className='game-container'>
                    <Modal
                        show={showGameModal}
                        onHide={handleCloseGameModal}
                        backdrop="static"
                        keyboard={false}
                    >

                        <div className='explore-modal-title-container'>
                            <div className='explore-modal-title'>
                                {roundGameId ? (
                                    <Round battleId={roundGameId} display={'title'} />
                                ) : (
                                    <Round display={'title'} />
                                )}
                            </div>
                        </div>

                        <Modal.Body>
                            {roundGameId ? "" : (<InputGroup className='game-modal-opponent-address'>
                                <InputGroup.Text>Opponents address</InputGroup.Text>
                                <Form.Control
                                    type='text'
                                    aria-label="Small"
                                    aria-describedby="inputGroup-sizing-sm"
                                    required
                                    value={startBattleArgs.address}
                                    onChange={handleChangeAddress} />
                            </InputGroup>)}
                            <br></br>
                            <h4 className='game-modal-title'>How many troops do you want to send?</h4><br></br>
                            <div className="game-modal-troops">
                                <div className="game-modal-troop-selector">
                                    <img src={predator} className="game-modal-troop-image" />
                                    <div className="game-modal-troop-info">
                                        <div className="game-modal-troop-name">
                                            Predator
                                        </div>
                                    </div>
                                    <InputGroup>
                                        <Form.Control
                                            name='predator'
                                            type='number'
                                            defaultValue={0}
                                            min={0}
                                            max={predatorMaxTroops}
                                            aria-label="Small"
                                            aria-describedby="inputGroup-sizing-sm"
                                            value={startBattleArgs.predatorTroops}
                                            onChange={handleChangeTroops} />
                                        <InputGroup.Text>/ {predatorMaxTroops}</InputGroup.Text>
                                    </InputGroup>
                                </div>
                                <div className="game-modal-troop-selector">
                                    <img src={proximus_cobra} className="game-modal-troop-image" />
                                    <div className="game-modal-troop-info">
                                        <div className="game-modal-troop-name">
                                            Proximus Cobra
                                        </div>
                                    </div>
                                    <InputGroup>
                                        <Form.Control
                                            name='proximus'
                                            type='number'
                                            defaultValue={0}
                                            min={0}
                                            max={proximusCobraMaxTroops}
                                            aria-label="Small"
                                            aria-describedby="inputGroup-sizing-sm"
                                            value={startBattleArgs.proximusTroops}
                                            onChange={handleChangeTroops} />
                                        <InputGroup.Text>/ {proximusCobraMaxTroops}</InputGroup.Text>
                                    </InputGroup>                                </div>
                                <div className="game-modal-troop-selector">
                                    <img src={bounty_hunter} className="game-modal-troop-image" />
                                    <div className="game-modal-troop-info">
                                        <div className="game-modal-troop-name">
                                            Bounty Hunter
                                        </div>
                                    </div>
                                    <InputGroup>
                                        <Form.Control
                                            name='bounty'
                                            type='number'
                                            defaultValue={0}
                                            min={0}
                                            max={bountyHunterMaxTroops}
                                            aria-label="Small"
                                            aria-describedby="inputGroup-sizing-sm"
                                            value={startBattleArgs.bountyTroops}
                                            onChange={handleChangeTroops} />
                                        <InputGroup.Text>/ {bountyHunterMaxTroops}</InputGroup.Text>
                                    </InputGroup>                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Row>
                                <Col className='explore-col'>
                                    <Button className='explore-button' variant="primary" onClick={() => roundGameId ? writeRequestBattle?.() : writeBattle?.()}>Attack</Button>
                                </Col>
                                <Col className='explore-col'>
                                    <Button className='explore-button-cancel' variant="secondary" onClick={handleCloseGameModal}>Abort</Button>
                                </Col>
                            </Row>
                        </Modal.Footer>
                    </Modal>
                    <div className="play-buttons">
                        <Button className='game-play-button' variant='primary' onClick={() => startNewBattle()}>Private game</Button>
                        <Button className='game-play-button' variant='primary' onClick={() => writeBattle?.()} disabled>Public game</Button>
                    </div>
                    <div className="games-list-container">
                        {gamesList?.map((game, index) => {
                            var profile_image;
                            switch (index) {
                                default:
                                    profile_image = profiles[index];
                                    break;
                            }
                            if (parseInt(game.winner) == 0)
                                return (
                                    <div key={index} className='game-box'>
                                        <div className={'point ' + (game.nextMove == address ? 'active' : '')}></div>
                                        <div className="game-title">
                                            <div className="game-id">
                                                GAME #{parseInt(game.battleId)}
                                            </div>
                                        </div>
                                        <div className="game-round">
                                            (Round {parseInt(game.currentRound)})
                                        </div>
                                        <Row className="game-versus">
                                            <Col className='game-versus-profile-col'>
                                                <img src={profile_1} className="game-versus-profile you" />
                                                <div className="game-versus-profile-life-bar">
                                                    <div className="game-versus-profile-life"></div>
                                                    <div className="game-versus-profile-life-text">70</div>
                                                </div>
                                            </Col>
                                            <Col><img className='game-versus-img' src={game.nextMove == address ? battle_turn : battle} /></Col>
                                            <Col className='game-versus-profile-col'>
                                                <img src={profile_image} className="game-versus-profile opponent" />
                                                <div className="game-versus-profile-life-bar">
                                                    <div className="game-versus-profile-life"></div>
                                                    <div className="game-versus-profile-life-text">35</div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="game-winner">
                                            {parseInt(game.winner) == 0 ? "" : (
                                                parseInt(game.winner) == address ? (
                                                    "VICTORY"
                                                ) : (
                                                    "DEFEAT"
                                                )
                                            )}
                                        </div>
                                        <div className="game-play">
                                            {game.nextMove == address ? (
                                                <Button onClick={() => game.nextMove == address ? playRound(game.battleId) : handleShowGameModal()} className='game-play-button'>Play turn</Button>
                                            ) : (
                                                <Button className='game-play-button' disabled>Opponents turn</Button>
                                            )}
                                        </div>

                                    </div>
                                );

                        })}
                    </div>
                    <div className="history-list-container">
                        <div className="games-history-bar col-lg-12 col"><p className="games-history-bar-text">Match history</p></div>
                        <Accordion className="history-box">
                            {gamesList?.map((game, index) => {
                                if (parseInt(game.winner) != 0)
                                    return (
                                        <Accordion.Item key={index} eventKey={index}>
                                            <Accordion.Header as='div' bsPrefix='history-box-header'>
                                                <div className="history-box-header-result">{parseInt(game.winner) == address ? "VICTORY" : "DEFEAT"}</div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <ul>
                                                    <li>
                                                        <strong>Battle ID: </strong>{parseInt(game.battleId)}
                                                    </li>
                                                    <li>
                                                        <strong>Opponent: </strong>{parseInt(game.creator) == address ? game.opponent : game.creator}
                                                    </li>
                                                    <li>
                                                        <strong>Status: </strong>{game.winner == address ? "Victory" : "Defeat"}
                                                    </li>
                                                </ul>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    );
                            })}
                        </Accordion>

                    </div>
                </div></>
            )
        }
    
    
        
    }
    
}

export default Game;