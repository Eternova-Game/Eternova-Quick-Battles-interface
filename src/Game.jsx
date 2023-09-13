import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import { useAccount, useContractReads, useContractWrite, useNetwork, usePrepareContractWrite, useSwitchNetwork, useWaitForTransaction } from 'wagmi';
import EternovaQuickBattlesABI from './abis/EternovaQuickBattles.abi.json';
import './Game.css';



const Game = () => {
    const { openConnectModal } = useConnectModal();
    const { address, pendingConnector, isConnected, isConnecting, isDisconnected } = useAccount();
    const [selectedHash, setSelectedHash] = useState(null);
    const [loading, setLoading] = useState(0);
    const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();
    const { chain } = useNetwork();
    let gamesList = [];


    const { data: hashData, isError: isErrorHashData, isLoading: isLoadingHashData } = useWaitForTransaction({
        hash: selectedHash,
        onSuccess(hashData) {
            setLoading(false);
            console.log(battleData);
        },
        onError(e) {
            setLoading(false);
        }
    })

    const EternovaQuickBattlesContract = {
        address: process.env.REACT_APP_CONTRACT_ADDRESS,
        abi: EternovaQuickBattlesABI
    }

    const { data, isError, isSuccess } = useContractReads({
        contracts: [
            {
                ...EternovaQuickBattlesContract,
                functionName: 'getUserBattleData',
                args: [
                    address,
                    10,
                    0
                ]
            }
        ],
        watch: true,
        enabled: isConnected ? true : false
    })


    const { config: configBattle, error: errorBattle } = usePrepareContractWrite({
        address: process.env.REACT_APP_CONTRACT_ADDRESS,
        abi: EternovaQuickBattlesABI,
        functionName: 'startBattle',
        args: [
            '0x8517CB745DA514A97fE97955CFCF229Ab83a7bF0',
            [
                5,
                0,
                0
            ],
            {
                gasLimit: 1300000
            },
        ]
    })

    const { config: configRequestBattle, error: errorRequestBattle } = usePrepareContractWrite({
        address: process.env.REACT_APP_CONTRACT_ADDRESS,
        abi: EternovaQuickBattlesABI,
        functionName: 'requestBattle',
        args: [
            4,
            [
                5,
                0,
                0
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


    if (isDisconnected)
    return (
        <Button onClick={openConnectModal}>Connect wallet</Button>
    )

    if (isConnected) {
        if(chain?.id != process.env.REACT_APP_CHAIN_ID) {
            return (
                <Button onClick={() => switchNetwork?.(parseInt(process.env.REACT_APP_CHAIN_ID))}>CHANGE NETWORK</Button>
            )
        } else {
            if (data) {
                gamesList = data[0];
                console.log(address)
                console.log(gamesList)
            }

            return (
                <div className='game-container'>
                    <div className="play-buttons">
                        <Button variant='primary' onClick={() => writeBattle?.()}>Private game</Button>
                        <Button variant='primary' onClick={() => writeBattle?.()}>Public game</Button>
                    </div>
                    <div className="games-list-container">
                        {
                            gamesList?.map((game, index) => {
                                if (parseInt(game.winner) == 0)
                                return (
                                    <div key={index} className='game-box'>
                                        <div className="game-id">
                                            GAME #{parseInt(game.battleId)}
                                        </div>
                                        <div className="game-round">
                                            (Round {parseInt(game.currentRound)})
                                        </div>
                                        <div className="game-versus">
                                            {address.slice(0, 21)}...<br></br> VS<br></br>{game.opponent.slice(0, 21)}...
                                        </div>
                                        <div className="game-winner">
                                            {
                                                parseInt(game.winner) == 0 ? "" : (
                                                    parseInt(game.winner) == address ? (
                                                        "VICTORY"
                                                    ) : (
                                                        "DEFEAT"
                                                    )
                                                )
                                            }
                                        </div>
                                        <div className="game-play">
                                            {
                                                game.nextMove == address ? (
                                                    <Button onClick={() => writeRequestBattle?.()} className='game-play-button'>Play turn</Button>
                                                ) : (
                                                    <Button className='game-play-button' disabled>Opponents turn</Button>
                                                )
                                            }
                                        </div>
                                        
                                    </div>
                                )
                                
                            })
                        }
                    </div>
                    <div className="history-list-container">
                        <h2>Match history</h2>
                        <Accordion className="history-box">
                            {
                                gamesList?.map((game, index) => {
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
                                    )
                                })
                            }
                        </Accordion>

                    </div>
                </div>
            )
        }
    
    
        
    }
    
}

export default Game;