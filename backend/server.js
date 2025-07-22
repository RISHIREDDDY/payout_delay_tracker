require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');

// Debug logging
console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Present' : 'Missing');
console.log('DISCORD_WEBHOOK_URL:', process.env.DISCORD_WEBHOOK_URL ? 'Present' : 'Missing');

const app = express();
const PORT = 4000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const HF_API_KEY = process.env.OPENAI_API_KEY; // This is actually the Hugging Face API token
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.use(cors());
app.use(bodyParser.json());

async function generateEmpathyMessage(prompt) {
    try {
        console.log('Attempting to generate message with Hugging Face API...');
        const hfRes = await axios.post(
            'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
            { 
                inputs: `<s>[INST] Generate a short, empathetic message for a delayed payout. Context: ${prompt} [/INST]`,
                parameters: {
                    max_new_tokens: 100,
                    temperature: 0.7,
                    top_p: 0.95,
                    return_full_text: false
                }
            },
            {
                headers: { 
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Hugging Face API Response:', hfRes.data);
        if (hfRes.data && hfRes.data.generated_text) {
            return hfRes.data.generated_text;
        } else {
            throw new Error('Invalid response format from Hugging Face');
        }
    } catch (error) {
        console.error('❌ Hugging Face generation error:', error.response?.data || error.message);
        // Return a more detailed default message including the reason
        const leadInfo = prompt.split(': ')[1]; // Extract the lead info from the prompt
        return `We sincerely apologize for the delayed payout. ${leadInfo}. We understand this is causing inconvenience and we are working diligently to resolve this matter. Our team is actively working on your case and will keep you updated on the progress.`;
    }
}

async function checkAndSendDelayedMessages() {
    try {
        const { data: leads, error } = await supabase.from('leads').select('*');
        if (error) throw error;

        const now = new Date();

        for (const lead of leads) {
            const submitted = new Date(lead.submitted_date);
            const days = Math.floor((now - submitted) / (1000 * 60 * 60 * 24));

            if (days > 7 && lead.status !== 'Paid' && !lead.empathy_sent) {
                const leadInfo = `User ${lead.user_id}, product ${lead.product}, reason: ${lead.delay_reason}`;
                const prompt = `Generate an empathetic apology for delayed payout: ${leadInfo}`;

                const rawMessage = await generateEmpathyMessage(prompt);

                // Sanitize for Discord
                let safeMessage = rawMessage.replace(/[`*_~]/g, '').trim();
                if (safeMessage.length > 1900) {
                    safeMessage = safeMessage.slice(0, 1900) + '...';
                }

                try {
                    const discordRes = await axios.post(DISCORD_WEBHOOK_URL, {
                        content: `📢 **Delayed payout alert for ${lead.user_id}**\n\n${safeMessage}\n\n**Delay Reason:** ${lead.delay_reason}\n**Days Delayed:** ${days} days`
                    });

                    if (discordRes.status === 204) {
                        console.log(`✅ Discord message sent for ${lead.user_id}`);
                    } else {
                        console.warn(`⚠️ Discord response status: ${discordRes.status}`);
                    }
                } catch (discordErr) {
                    console.error(`❌ Failed to send Discord message for ${lead.user_id}:`, discordErr.response?.data || discordErr.message);
                }

                await supabase.from('leads').update({ empathy_sent: true }).eq('id', lead.id);
            }
        }
    } catch (error) {
        console.error('Error during automatic empathy check:', error);
    }
}

// Run every hour at minute 0
cron.schedule('0 * * * *', () => {
    console.log('⏰ Running scheduled empathy check...');
    checkAndSendDelayedMessages();
});

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Payout Delay Tracker Backend is running');
});

// Manual trigger endpoint for Discord check
app.post('/trigger-discord-check', async (req, res) => {
    try {
        await checkAndSendDelayedMessages();
        res.status(200).json({ message: 'Discord check triggered.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    // Test Discord message sending immediately
    console.log('Testing Discord message sending...');
    checkAndSendDelayedMessages();
});
