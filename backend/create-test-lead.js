require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function createTestLead() {
    try {
        // Create dates for different scenarios
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const twentyFiveDaysAgo = new Date();
        twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const testLeads = [
            {
                product: 'Car Loan',
                status: 'Pending',
                submitted_date: tenDaysAgo.toISOString(),
                user_id: 'vikas@example.com',
                user_phone: '+919800112233',
                delay_reason: 'Loan approval delayed due to pending address verification',
                empathy_sent: false
            },
            {
                product: 'Personal Loan',
                status: 'Pending',
                submitted_date: tenDaysAgo.toISOString(),
                user_id: 'rohit@example.com',
                user_phone: '+919800112235',
                delay_reason: 'Income verification pending and bank statement analysis required',
                empathy_sent: false
            },
            {
                product: 'Home Loan',
                status: 'Pending',
                submitted_date: tenDaysAgo.toISOString(),
                user_id: 'amit@example.com',
                user_phone: '+919800112236',
                delay_reason: 'Property papers under review',
                empathy_sent: false
            },
            {
                product: 'Personal Loan',
                status: 'Pending',
                submitted_date: tenDaysAgo.toISOString(),
                user_id: 'priya@example.com',
                user_phone: '+919800112237',
                delay_reason: 'Additional documentation required for verification',
                empathy_sent: false
            },
             {
                product: 'Car Loan',
                status: 'Pending',
                submitted_date: twentyFiveDaysAgo.toISOString(),
                user_id: 'varun@example.com',
                user_phone: '+919800112238',
                delay_reason: 'Vehicle inspection pending',
                empathy_sent: false
            },
            {
                product: 'office Loan',
                status: 'Pending',
                submitted_date: twentyFiveDaysAgo.toISOString(),
                user_id: 'ajay@example.com',
                user_phone: '+919800112238',
                delay_reason: 'inspection pending',
                empathy_sent: false
            },
            {
                product: 'Personal Loan',
                status: 'Pending',
                submitted_date: thirtyDaysAgo.toISOString(),
                user_id: 'gowtham@example.com',
                user_phone: '+919800112239',
                delay_reason: 'Document verification pending',
                empathy_sent: false
            }
        ];

        const { data, error } = await supabase
            .from('leads')
            .insert(testLeads)
            .select();

        if (error) {
            console.error('Error creating test leads:', error);
            return;
        }

        console.log('✅ Test leads created successfully:');
        data.forEach(lead => {
            console.log(`\nLead for ${lead.user_id}:`);
            console.log(JSON.stringify(lead, null, 2));
            console.log('\nThis lead should trigger a Discord message because:');
            console.log('- It is more than 7 days old');
            console.log('- Status is not "Paid"');
            console.log('- Empathy message has not been sent yet');
            console.log('- Has a specific delay reason for testing');
            console.log('----------------------------------------');
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

createTestLead(); 