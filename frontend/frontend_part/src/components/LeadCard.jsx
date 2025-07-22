export default function LeadCard({ lead }) {
    const calculateDelay = (lead) => {
        const submitted = new Date(lead.submitted_date);
        const now = new Date();
        const days = Math.floor((now - submitted) / (1000 * 60 * 60 * 24));
        return days > 7 && lead.status !== 'Paid';
    };

    const isDelayed = calculateDelay(lead);
    const daysSinceSubmission = Math.floor((new Date() - new Date(lead.submitted_date)) / (1000 * 60 * 60 * 24));

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getProductIcon = (product) => {
        switch (product.toLowerCase()) {
            case 'home loan':
                return '🏠';
            case 'car loan':
                return '🚗';
            case 'personal loan':
                return '💼';
            default:
                return '📋';
        }
    };

    return (
        <div className={`rounded border ${isDelayed ? 'bg-red-100 border-red-200' : 'bg-green-100 border-green-200'} hover:shadow-sm transition-all duration-200`}>
            <div className="p-3 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-800 truncate">{lead.product}</h2>
                        <p className="text-xs text-gray-500">ID: {lead.id.slice(0, 8)}...</p>
                        {lead.empathy_sent && (
                            <p className="inline-block text-[10px] text-green-800 font-semibold bg-blue-100 px-1 py-0.5 rounded mt-1">Empathy message sent</p>
                        )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                        <p className="text-gray-500">Submitted</p>
                        <p className="text-gray-800 font-medium">
                            {new Date(lead.submitted_date).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500">Days</p>
                        <p className="text-gray-800 font-medium">{daysSinceSubmission} days</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
