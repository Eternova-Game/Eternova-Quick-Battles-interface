import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
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
        address: '0xc1B161a52148252D81b91C151597D2830D6b0b12',
        abi: EternovaQuickBattlesABI,
        functionName: 'startBattle',
        args: [
            '0x94a3294e2B721b852C64b8F867231BD7B2384338',
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
                        <Button onClick={() => writeBattle?.()}>Start Battle</Button>
                    </div>
                    <hr></hr>
                    <div className="games-list-container">
                        {
                            gamesList.map((game, index) => {
                                return (
                                    <div id={index} className='game-box'>
                                        <div className="game-id">
                                            GAME #{parseInt(game.battleId)}
                                        </div>
                                        <div className="game-round">
                                            (Round {parseInt(game.currentRound)})
                                        </div>
                                        <div className="game-versus">
                                            You VS {game.opponent.slice(0,12)}...
                                        </div>
                                        <div className="game-play">
                                            {
                                                game.nextMove != game.opponent ? (
                                                    <Button className='game-play-button'>Play turn</Button>
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
                </div>
            )
        }
    
    
        
    }
    
}

export default Game;