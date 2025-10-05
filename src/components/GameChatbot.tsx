import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  HelpCircle,
  Gamepad2,
  Coins,
  Trophy,
  Settings,
  ExternalLink,
  Minimize2
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: number;
  quickReplies?: string[];
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
  followUp?: string[];
}

const GameChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FAQ Database
  const faqs: FAQ[] = [
    {
      question: "How do I start playing?",
      answer: "Welcome to Avalanche Rush! 🎮 To start playing:\n1. Connect your wallet (MetaMask recommended)\n2. Switch to Avalanche network\n3. Choose a game mode\n4. Start earning RUSH tokens!",
      category: "getting-started",
      followUp: ["How to connect wallet", "What is RUSH token", "Game modes"]
    },
    {
      question: "How to connect wallet",
      answer: "To connect your wallet:\n1. Click 'Connect Wallet' button\n2. Select MetaMask\n3. Approve the connection\n4. Switch to Avalanche Fuji Testnet\n5. You're ready to play! 🦊",
      category: "wallet",
      followUp: ["Get test AVAX", "Wallet issues", "Supported networks"]
    },
    {
      question: "What is RUSH token",
      answer: "RUSH is our native gaming token! 🪙\n• Earn by playing games\n• Use for tournament entries\n• Buy premium features\n• Trade on marketplace\n• Stake for rewards",
      category: "tokens",
      followUp: ["How to earn RUSH", "RUSH staking", "Token price"]
    },
    {
      question: "Game modes",
      answer: "We have several exciting game modes:\n🎯 Classic Mode - Endless runner\n🏆 Tournament Mode - Compete globally\n📚 Tutorial Mode - Learn Web3\n💎 Collection Mode - Collect NFTs",
      category: "gameplay",
      followUp: ["Tournament rules", "NFT rewards", "Difficulty levels"]
    },
    {
      question: "How to earn RUSH",
      answer: "Multiple ways to earn RUSH tokens:\n• Play games (1-10 RUSH per game)\n• Win tournaments (100-10,000 RUSH)\n• Complete achievements\n• Daily login bonuses\n• Referral rewards",
      category: "earning",
      followUp: ["Tournament schedule", "Achievement list", "Referral program"]
    },
    {
      question: "Premium subscription",
      answer: "Premium benefits:\n⭐ Premium ($9.99/month):\n• 2x RUSH rewards\n• Priority tournaments\n• Exclusive NFTs\n👑 Pro ($19.99/month):\n• 3x RUSH rewards\n• VIP access\n• Custom avatars",
      category: "premium",
      followUp: ["How to subscribe", "Payment methods", "Cancel subscription"]
    },
    {
      question: "NFT marketplace",
      answer: "Trade your achievement NFTs:\n🎨 Browse collections\n💰 Set your prices\n🔄 Make offers\n📈 Track values\nAll trades use RUSH tokens!",
      category: "nft",
      followUp: ["How to list NFT", "Trading fees", "Rare NFTs"]
    },
    {
      question: "Technical issues",
      answer: "Common fixes:\n🔄 Refresh the page\n🦊 Check MetaMask connection\n🌐 Verify network (Avalanche)\n💰 Ensure sufficient AVAX for gas\n📞 Contact support if issues persist",
      category: "support",
      followUp: ["Gas fees", "Network issues", "Contact support"]
    },
    {
      question: "Contact support",
      answer: "Need more help? Reach us:\n💬 Discord: discord.gg/avalanche-rush\n📧 Email: support@avalanche-rush.com\n🐦 Twitter: @AvalancheRush\n📱 Telegram: t.me/avalanche_rush",
      category: "support",
      followUp: ["Discord invite", "Report bug", "Feature request"]
    }
  ];

  const quickStartOptions = [
    "How do I start playing?",
    "What is RUSH token?",
    "Game modes",
    "Premium subscription",
    "Technical issues"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Show notification dot after 5 seconds if not opened
    const timer = setTimeout(() => {
      if (!isOpen) {
        setHasNotification(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const addMessage = (text: string, isBot: boolean = false, quickReplies?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: Date.now(),
      quickReplies
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (callback: () => void, delay = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleSendMessage = (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText) return;

    // Add user message
    addMessage(messageText, false);
    setInputValue('');

    // Find matching FAQ
    const faq = faqs.find(f => 
      f.question.toLowerCase().includes(messageText.toLowerCase()) ||
      messageText.toLowerCase().includes(f.question.toLowerCase().split(' ')[0])
    );

    simulateTyping(() => {
      if (faq) {
        addMessage(faq.answer, true, faq.followUp);
      } else {
        // Generic response with suggestions
        addMessage(
          "I'm here to help! 🤖 Here are some things I can help you with:",
          true,
          quickStartOptions
        );
      }
    });
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setHasNotification(false);
    
    // Welcome message if first time
    if (messages.length === 0) {
      simulateTyping(() => {
        addMessage(
          "Hi there! 👋 Welcome to Avalanche Rush! I'm here to help you get started. What would you like to know?",
          true,
          quickStartOptions
        );
      }, 800);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const formatMessageText = (text: string) => {
    // Convert markdown-like formatting to JSX
    const lines = text.split('\n');
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {line.startsWith('•') ? (
          <div className="ml-2 text-sm">{line}</div>
        ) : line.match(/^\d\./) ? (
          <div className="font-medium text-sm">{line}</div>
        ) : (
          <span className="text-sm">{line}</span>
        )}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <>
      {/* Chat Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        {!isOpen && (
          <motion.button
            onClick={handleOpenChat}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="w-8 h-8" />
            
            {/* Notification Dot */}
            <AnimatePresence>
              {hasNotification && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
                />
              )}
            </AnimatePresence>

            {/* Pulse Animation */}
            <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping" />
          </motion.button>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '60px' : '500px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Rush Assistant</h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs opacity-80">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMinimize}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCloseChat}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-xs ${message.isBot ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-2xl p-3 ${
                          message.isBot 
                            ? 'bg-white text-gray-800 border border-gray-200' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        }`}>
                          {formatMessageText(message.text)}
                        </div>
                        
                        {/* Quick Replies */}
                        {message.quickReplies && (
                          <div className="mt-2 space-y-1">
                            {message.quickReplies.map((reply, index) => (
                              <button
                                key={index}
                                onClick={() => handleSendMessage(reply)}
                                className="block w-full text-left text-xs bg-blue-50 text-blue-700 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <div className={`text-xs text-gray-500 mt-1 ${message.isBot ? 'text-left' : 'text-right'}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isBot 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white order-1 mr-2' 
                          : 'bg-gray-300 text-gray-600 order-2 ml-2'
                      }`}>
                        {message.isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center mr-2">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your question..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim()}
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-shadow disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Quick Action Buttons */}
                  <div className="flex justify-center space-x-2 mt-3">
                    <button
                      onClick={() => handleSendMessage("How do I start playing?")}
                      className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Gamepad2 className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage("What is RUSH token?")}
                      className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Coins className="w-3 h-3" />
                      <span>RUSH</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage("Technical issues")}
                      className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Help</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameChatbot;
