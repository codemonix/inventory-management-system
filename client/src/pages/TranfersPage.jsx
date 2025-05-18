import TransferList from "../components/TransferList.jsx";


const TransfersPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Transfers</h1>
            <p className="mb-4">Manage your transfers between locations.</p>
            <TransferList />
        </div>
    )
}

export default TransfersPage;