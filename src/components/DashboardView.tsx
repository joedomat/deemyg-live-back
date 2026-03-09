import React, { useState } from 'react';
import { useStore } from '../StoreContext';
import { GIFTS } from '../constants';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trash2, Plus, Star, Gift, Trophy, Settings } from 'lucide-react';

const DashboardView = () => {
    const [activeTab, setActiveTab] = useState<'fan' | 'donator'>('fan');

    const {
        donators, removeDonator,
        fans, addFan, removeFan,
        activeChallenge, setActiveChallenge,
        addDonator
    } = useStore();

    const [newFanName, setNewFanName] = useState('');
    const [newFanLevel, setNewFanLevel] = useState(1);
    const [newDonatorName, setNewDonatorName] = useState('');
    const [selectedGift, setSelectedGift] = useState(GIFTS[0].name);

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8 font-body">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-primary">Control Dashboard</h1>
                    <p className="text-zinc-500 font-medium">Manage your stream events behind the scenes</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400">
                        <Settings className="w-4 h-4 mr-2" /> Settings
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Quick Actions & Challenge */}
                <div className="space-y-8">
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" /> Active Challenge
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                value={activeChallenge}
                                onChange={(e) => setActiveChallenge(e.target.value)}
                                className="bg-zinc-950 border-zinc-800 text-lg py-6"
                                placeholder="Enter current challenge..."
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Plus className="w-5 h-5 text-primary" /> Add Event
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full">
                                <div className="w-full flex bg-zinc-950 border border-zinc-800 rounded-md p-1 mb-6">
                                    <button
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-sm transition-all ${activeTab === 'fan' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                                        onClick={() => setActiveTab('fan')}
                                    >
                                        Fan
                                    </button>
                                    <button
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-sm transition-all ${activeTab === 'donator' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                                        onClick={() => setActiveTab('donator')}
                                    >
                                        Gift
                                    </button>
                                </div>

                                {activeTab === 'fan' && (
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Fan Name"
                                            value={newFanName}
                                            onChange={(e) => setNewFanName(e.target.value)}
                                            className="bg-zinc-950 border-zinc-800"
                                        />
                                        <div className="flex gap-2">
                                            {[1, 5, 10, 15, 20].map(lvl => (
                                                <Button
                                                    key={lvl}
                                                    variant={newFanLevel === lvl ? 'default' : 'outline'}
                                                    onClick={() => setNewFanLevel(lvl)}
                                                    className={`flex-1 ${newFanLevel === lvl ? 'bg-primary' : 'bg-zinc-950 border-zinc-800'} px-1`}
                                                >
                                                    Lv {lvl}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            className="w-full font-bold uppercase tracking-widest"
                                            onClick={() => {
                                                if (newFanName) {
                                                    addFan(newFanName, newFanLevel);
                                                    setNewFanName('');
                                                }
                                            }}
                                        >
                                            Add Fan Club
                                        </Button>
                                    </div>
                                )}

                                {activeTab === 'donator' && (
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Donator Name"
                                            value={newDonatorName}
                                            onChange={(e) => setNewDonatorName(e.target.value)}
                                            className="bg-zinc-950 border-zinc-800"
                                        />
                                        <select
                                            className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-md outline-none focus:border-primary"
                                            value={selectedGift}
                                            onChange={(e) => setSelectedGift(e.target.value)}
                                        >
                                            {GIFTS.map(g => (
                                                <option key={g.name} value={g.name}>{g.name} (${g.price})</option>
                                            ))}
                                        </select>
                                        <Button
                                            className="w-full font-bold uppercase tracking-widest"
                                            onClick={() => {
                                                if (newDonatorName) {
                                                    addDonator(newDonatorName, selectedGift);
                                                    setNewDonatorName('');
                                                }
                                            }}
                                        >
                                            Drop Gift
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Middle: Fan List */}
                <Card className="bg-zinc-900 border-zinc-800 text-white lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 mb-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Star className="w-5 h-5 text-primary" /> DeemyGang Members
                        </CardTitle>
                        <span className="text-zinc-500 text-sm font-bold uppercase">{fans.length} total</span>
                    </CardHeader>
                    <CardContent className="h-[600px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-3">
                            {fans.map(fan => (
                                <div key={fan.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl group">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center font-bold"
                                            style={{ color: fan.color, border: `2px solid ${fan.color}33` }}
                                        >
                                            {fan.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold">{fan.name}</p>
                                            <p className="text-xs text-zinc-500 uppercase tracking-tighter">Level {fan.level} • {new Date(fan.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 transition-all"
                                        onClick={() => removeFan(fan.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Donator History */}
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 mb-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Gift className="w-5 h-5 text-green-500" /> Recent Gifts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[600px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-3">
                            {donators.map(d => (
                                <div key={d.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                            {d.gift[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold">{d.name}</p>
                                            <p className="text-xs text-zinc-500 uppercase tracking-tighter">{d.gift} • {new Date(d.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 transition-all"
                                        onClick={() => removeDonator(d.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardView;
