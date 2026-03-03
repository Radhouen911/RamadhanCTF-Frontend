export interface Challenge {
  id: number;
  name: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  solves: number;
  solved: boolean;
  description: string;
  hint?: string;
  tags: string[];
  hasContainer?: boolean;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  darkColor: string;
  midColor: string;
  glowColor: string;
  challenges: Challenge[];
}

export const categories: Category[] = [
  {
    id: 'web',
    name: 'Web',
    iconName: 'Globe',
    color: '#60a5fa',
    darkColor: '#1e3a8a',
    midColor: '#3b82f6',
    glowColor: 'rgba(96, 165, 250, 0.6)',
    challenges: [
      { id: 1, name: 'Cookie Jar', points: 50, difficulty: 'Easy', solves: 156, solved: false, description: 'They say cookies are sweet. Find the hidden session token baked into this site.', tags: ['cookies', 'web', 'session'], hasContainer: true },
      { id: 2, name: 'SQL Sunrise', points: 100, difficulty: 'Easy', solves: 98, solved: true, description: 'The database holds secrets from the night. Make it reveal its dawn-lit truths.', hint: 'Single quotes are your lantern in the dark.', tags: ['sql', 'injection'], hasContainer: true },
      { id: 3, name: 'JWT Phantom', points: 250, difficulty: 'Medium', solves: 45, solved: false, description: 'A broken token lies between you and the admin panel. Forge your way through.', hint: 'Check the algorithm field carefully — none is something.', tags: ['jwt', 'auth', 'bypass'], hasContainer: true },
      { id: 4, name: 'XSS Mirage', points: 300, difficulty: 'Medium', solves: 32, solved: false, description: "Inject your script into the sands of this web page and steal the admin's cookie.", tags: ['xss', 'injection', 'client-side'] },
      { id: 5, name: 'SSRF Oasis', points: 500, difficulty: 'Hard', solves: 11, solved: false, description: 'From the outside, reach deep into the internal network and retrieve the hidden manuscript.', tags: ['ssrf', 'network', 'internal'] },
    ],
  },
  {
    id: 'crypto',
    name: 'Crypto',
    iconName: 'Lock',
    color: '#c084fc',
    darkColor: '#4c1d95',
    midColor: '#9333ea',
    glowColor: 'rgba(192, 132, 252, 0.6)',
    challenges: [
      { id: 6, name: "Caesar's Secret", points: 50, difficulty: 'Easy', solves: 201, solved: true, description: 'Even the mightiest empires fall to simple ciphers. Decipher what the ancients hid.', tags: ['classical', 'cipher', 'rot'] },
      { id: 7, name: 'RSA Crescent', points: 150, difficulty: 'Medium', solves: 67, solved: false, description: 'The modulus shines like a crescent moon but is weaker than it seems. Factor it.', hint: 'Small prime factors hide in plain sight.', tags: ['rsa', 'factoring', 'math'] },
      { id: 8, name: 'AES Oracle', points: 300, difficulty: 'Medium', solves: 28, solved: false, description: 'A padding oracle dances under the desert moon. Use it to decrypt the message.', tags: ['aes', 'padding-oracle', 'cbc'] },
      { id: 9, name: 'ECC Veil', points: 450, difficulty: 'Hard', solves: 9, solved: false, description: 'Elliptic curves weave sacred geometry. Find the discrete log and lift the veil.', tags: ['ecc', 'math', 'discrete-log'] },
    ],
  },
  {
    id: 'pwn',
    name: 'Pwn',
    iconName: 'Terminal',
    color: '#f87171',
    darkColor: '#7f1d1d',
    midColor: '#dc2626',
    glowColor: 'rgba(248, 113, 113, 0.6)',
    challenges: [
      { id: 10, name: 'Stack Sands', points: 100, difficulty: 'Easy', solves: 88, solved: false, description: 'Overflow the buffer and seize control of the instruction pointer. The shell awaits.', tags: ['bof', 'stack', 'shellcode'] },
      { id: 11, name: 'Format Dunes', points: 200, difficulty: 'Medium', solves: 41, solved: false, description: 'A forgotten format string vulnerability sleeps in the desert. Wake it and write memory.', hint: '%p %p %p — what do you see?', tags: ['format-string', 'memory-write'] },
      { id: 12, name: 'ROP Desert', points: 350, difficulty: 'Medium', solves: 23, solved: false, description: 'Chain gadgets like golden beads on a tasbih string. No shellcode allowed.', tags: ['rop', 'x64', 'nx'] },
      { id: 13, name: 'Heap Mirage', points: 500, difficulty: 'Hard', solves: 7, solved: false, description: 'The heap allocator is a mirage. Corrupt it, control it, own the system.', tags: ['heap', 'tcache', 'glibc'] },
    ],
  },
  {
    id: 'forensics',
    name: 'Forensics',
    iconName: 'Search',
    color: '#34d399',
    darkColor: '#064e3b',
    midColor: '#059669',
    glowColor: 'rgba(52, 211, 153, 0.6)',
    challenges: [
      { id: 14, name: 'Hidden Scroll', points: 50, difficulty: 'Easy', solves: 178, solved: true, description: 'Something sacred is embedded in this image. Steganography reveals ancient scrolls.', tags: ['steganography', 'image', 'lsb'] },
      { id: 15, name: 'Network Caravan', points: 150, difficulty: 'Easy', solves: 95, solved: false, description: 'A caravan of packets crossed the network. Trace its path in this PCAP file.', tags: ['pcap', 'network', 'wireshark'] },
      { id: 16, name: 'Memory Relic', points: 300, difficulty: 'Medium', solves: 34, solved: false, description: 'A memory dump holds relics of a compromised system. Excavate the flag.', hint: 'Volatility knows the way.', tags: ['memory', 'volatility', 'forensics'] },
      { id: 17, name: 'Log Temple', points: 400, difficulty: 'Hard', solves: 15, solved: false, description: 'Reconstruct the entire attack chain from fragmented temple logs. Timeline is everything.', tags: ['logs', 'timeline', 'incident-response'] },
    ],
  },
  {
    id: 'misc',
    name: 'Misc',
    iconName: 'Sparkles',
    color: '#22d3ee',
    darkColor: '#164e63',
    midColor: '#0891b2',
    glowColor: 'rgba(34, 211, 238, 0.6)',
    challenges: [
      { id: 22, name: 'QR Lantern', points: 50, difficulty: 'Easy', solves: 189, solved: false, description: 'Light your lantern and scan the code hidden within this fragmented QR image.', tags: ['qr', 'encoding', 'image'] },
      { id: 23, name: 'Scripting Crescent', points: 150, difficulty: 'Easy', solves: 102, solved: true, description: 'Automate your way to the flag. Write a script to solve 1000 math problems in 5 seconds.', tags: ['scripting', 'automation', 'python'] },
      { id: 24, name: 'Logic Gate', points: 250, difficulty: 'Medium', solves: 47, solved: false, description: 'Navigate the labyrinth of logical operations. Truth tables light the path.', tags: ['logic', 'puzzle', 'circuit'] },
      { id: 25, name: 'Regex Riddle', points: 350, difficulty: 'Hard', solves: 18, solved: false, description: 'A regex pattern so complex it has become a riddle. Craft the perfect input to match.', tags: ['regex', 'pattern', 'string'] },
    ],
  },
];