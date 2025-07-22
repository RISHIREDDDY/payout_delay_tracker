require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded in check-leads.js:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Present' : 'Missing');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkLeads() {
    try {
        const { data: leads, error } = await supabase.from('leads').select('*');
        if (error) throw error;

        console.log('\n=== Checking Leads for Discord Messages ===\n');
        
        leads.forEach(lead => {
            const submitted = new Date(lead.submitted_date);
            const now = new Date();
            const days = Math.floor((now - submitted) / (1000 * 60 * 60 * 24));
            const shouldTriggerDiscord = days > 7 && lead.status !== 'Paid' && !lead.empathy_sent;

            console.log(`Lead ID: ${lead.id}`);
            console.log(`Product: ${lead.product}`);
            console.log(`Status: ${lead.status}`);
            console.log(`Submitted: ${lead.submitted_date}`);
            console.log(`Days since submission: ${days}`);
            console.log(`Empathy message sent: ${lead.empathy_sent ? 'Yes' : 'No'}`);
            console.log(`Should trigger Discord: ${shouldTriggerDiscord ? 'Yes' : 'No'}`);
            console.log('----------------------------------------\n');
        });

    } catch (error) {
        console.error('Error checking leads:', error);
    }
}

checkLeads(); 