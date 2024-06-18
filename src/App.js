import React, { useState, useEffect } from 'react'
import detectEthereumProvider from "@metamask/detect-provider"
import axios from 'axios'
import './App.css'
import './assets/css/sb-admin-2.min.css'
import './assets/vendor/fontawesome-free/css/all.min.css'

function App() {
    const [currentAccount, setCurrentAccount] = useState("")
    const [currentBalance, setCurrentBalance] = useState("")
    const [currentListings, setCurrentListings] = useState([])
    const URL = 'pro-api.coinmarketcap.com'

    const setup = async () => {
        const provider = await detectEthereumProvider()

        if (provider && provider === window.ethereum) {
            console.log("MetaMask is available!")
            startApp(provider)
        } else {
            console.log("Please install MetaMask!")
        }
    }

    const startApp = (provider) => {
        if (provider !== window.ethereum) {
            console.error("Do you have multiple wallets installed?")
        }
    }

    window.addEventListener("load", setup)

    const handleChainChanged = (chainId) => {
        window.location.reload()
    }

    window.ethereum
        .on("chainChanged", handleChainChanged)

    const getAccount = async () => {
        const accounts = await window.ethereum
            .request({ method: "eth_requestAccounts" })
            .catch((err) => {
                if (err.code === 4001) {
                    console.log("Please connect to MetaMask.")
                } else {
                    console.error(err)
                }
            })
        const account = accounts[0]
        localStorage.setItem('account', account)
        setCurrentAccount(account)
        getBalance(account)
    }

    const getBalance = async (account) => {
        const balance = await window.ethereum.request({
            "method": "eth_getBalance",
            "params": [
                account,
                "latest"
            ]
        });
        setCurrentBalance(parseInt(balance, 16).toString())
    }

    const getCrypto = async () => {
        let response = null;
        new Promise(async (resolve, reject) => {
            try {
                response = await axios.get(`https://${URL}/v1/cryptocurrency/listings/latest`, {
                    headers: {
                        'X-CMC_PRO_API_KEY': '748d58ed-7963-48fb-b28b-1f2b5f189885',
                    },
                });
            } catch (ex) {
                response = null;
                // error
                console.log(ex);
                reject(ex);
            }
            if (response) {
                // success
                const json = response.data;
                setCurrentListings(response.data.data.slice(0, 5))
                resolve(json);
            }
        });
    }

    const removeAccount = async () => {
        await window.ethereum.request({
            "method": "wallet_revokePermissions",
            "params": [
                {
                    "eth_accounts": {}
                }
            ]
        });
        localStorage.removeItem('account')
    }

    useEffect(() => {
        getCrypto()
    }, [])

    return (
        <div className="App">
            <div id="wrapper">
                <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
                    <a className="sidebar-brand d-flex align-items-center justify-content-center" href="index.html">
                        <div className="sidebar-brand-icon">
                            <i className="fas fa-wallet"></i>
                        </div>
                        <div className="sidebar-brand-text mx-3">Wallet</div>
                    </a>

                    <hr className="sidebar-divider my-0" />

                    <li className="nav-item active">
                        <a className="nav-link" href="index.html">
                            <i className="fas fa-fw fa-tachometer-alt"></i>
                            <span>Dashboard</span>
                        </a>
                    </li>
                </ul>
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

                            <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
                                <i className="fa fa-bars"></i>
                            </button>

                            {
                                currentAccount === "" ? (
                                    <button className="btn btn-primary" onClick={getAccount}>Connect Wallet</button>
                                ) : (
                                    <button className="btn btn-primary" onClick={removeAccount}>Disconnect Wallet</button>
                                )
                            }

                            <ul className="navbar-nav ml-auto">
                                <li className="nav-item dropdown no-arrow">
                                    <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <span className="mr-2 d-none d-lg-inline text-gray-600 small">{currentAccount || "No account connected"}</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>

                        <div className="container-fluid">
                            <div className="d-sm-flex align-items-center justify-content-start mb-4">
                                <h2 className="h2 mb-0 text-gray-800 mr-3">Dashboard</h2>
                                <button className="btn btn-outline-secondary" onClick={getCrypto}><i className="fas fa-sync-alt"></i></button>
                            </div>

                            <div className="row">
                                <div className="col-xl-3 col-md-6 mb-4">
                                    <div className="card border-left-primary shadow h-100 py-2">
                                        <div className="card-body">
                                            <div className="row no-gutters align-items-center">
                                                <div className="col mr-2">
                                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                        Balance</div>
                                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{currentBalance || "Not connected"}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-sm-flex align-items-center justify-content-start mb-4">
                                <h3 className="h4 mb-0 text-gray-800 mr-3">Latest Listings</h3>
                            </div>

                            <div className="row">
                                {
                                    currentListings.map((v, k) => {
                                        return (
                                            <div className="col-xl-3 col-md-6 mb-4">
                                                <div className="card border-left-secondary shadow h-100 py-2">
                                                    <div className="card-body">
                                                        <div className="row no-gutters align-items-center">
                                                            <div className="col mr-2">
                                                                <div className="text-xs font-weight-bold text-gray-800 text-uppercase mb-1">
                                                                    {v?.name || `Crypto ${k + 1}`}</div>
                                                                <div className="h5 mb-0 font-weight-bold text-gray-800">{parseFloat(v?.quote?.USD?.price).toFixed(3) || "0"} USD</div>
                                                                <div className="text-xs mb-0 text-gray-800">({parseFloat(v?.quote?.USD?.percent_change_24h).toFixed(3) || "0"}%)</div>
                                                            </div>
                                                            <div className="col-auto">
                                                                <img src={`./assets/img/${v?.slug}.png`} style={{ width: '50px' }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }

                            </div>
                        </div>

                        {/* <footer className="sticky-footer bg-white">
                            <div className="container my-auto">
                                <div className="copyright text-center my-auto">
                                    <span>Copyright</span>
                                </div>
                            </div>
                        </footer> */}
                    </div>
                </div>
            </div>
            <script src="./assets/vendor/jquery/jquery.min.js"></script>
            <script src="./assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
            <script src="./assets/vendor/jquery-easing/jquery.easing.min.js"></script>
            <script src="./assets/js/sb-admin-2.min.js"></script>
        </div>
    )
}

export default App
