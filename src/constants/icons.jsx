import React from 'react';
import {
  Hash, Percent, AlertCircle, AlertTriangle, HelpCircle, Info,
  Flame, Droplets, Wind, Mountain, Sun, Moon, Cloud, Earth, Waves,
  Sprout, Shell, Clover, Leaf, Sunrise,
  Atom, Binary, Cpu, Database, Dna, FlaskConical, Microscope, Telescope,
  Orbit, Bot, Component, Rocket, Radio, Magnet, Terminal,
  Monitor, Smartphone, Watch, Headphones, Mic, Music, Video,
  Image as ImageIcon, Camera, Gamepad2,
  Sword, Shield, Target as TargetIcon, Crosshair, Axe, Bomb, Skull,
  Hammer, Anchor as AnchorIcon,
  Heart, Brain, Eye as EyeIcon, User, Fingerprint, Pill,
  Activity as Pulse, Stethoscope, Syringe,
  Coffee, Cake, Gift, Wallet, ShoppingCart, GraduationCap, Library,
  Guitar, Dices,
  Bird, Fish, Dog, Cat, Rabbit, Turtle, Ghost, Squirrel, Bug,
} from 'lucide-react';

export const CATEGORIZED_ICONS = [
  {
    category: 'Utility & Syntax',
    icons: [
      { name: 'Hashtag', icon: Hash },
      { name: 'Percent', icon: Percent },
      { name: 'Important', icon: AlertCircle },
      { name: 'Warning', icon: AlertTriangle },
      { name: 'Question', icon: HelpCircle },
      { name: 'Info', icon: Info },
    ],
  },
  {
    category: 'Nature & Elements',
    icons: [
      { name: 'Flame', icon: Flame },
      { name: 'Droplets', icon: Droplets },
      { name: 'Wind', icon: Wind },
      { name: 'Mountain', icon: Mountain },
      { name: 'Sun', icon: Sun },
      { name: 'Moon', icon: Moon },
      { name: 'Cloud', icon: Cloud },
      { name: 'Earth', icon: Earth },
      { name: 'Waves', icon: Waves },
      { name: 'Forest', icon: Sprout },
      { name: 'Sprout', icon: Sprout },
      { name: 'Shell', icon: Shell },
      { name: 'Clover', icon: Clover },
      { name: 'Leaf', icon: Leaf },
      { name: 'Sunrise', icon: Sunrise },
    ],
  },
  {
    category: 'Science & Tech',
    icons: [
      { name: 'Atom', icon: Atom },
      { name: 'Binary', icon: Binary },
      { name: 'Cpu', icon: Cpu },
      { name: 'Database', icon: Database },
      { name: 'Dna', icon: Dna },
      { name: 'Flask', icon: FlaskConical },
      { name: 'Microscope', icon: Microscope },
      { name: 'Telescope', icon: Telescope },
      { name: 'Orbit', icon: Orbit },
      { name: 'Bot', icon: Bot },
      { name: 'Circuit', icon: Component },
      { name: 'Rocket', icon: Rocket },
      { name: 'Radio', icon: Radio },
      { name: 'Magnet', icon: Magnet },
      { name: 'Terminal', icon: Terminal },
    ],
  },
  {
    category: 'Devices & Media',
    icons: [
      { name: 'Monitor', icon: Monitor },
      { name: 'Smartphone', icon: Smartphone },
      { name: 'Watch', icon: Watch },
      { name: 'Headphones', icon: Headphones },
      { name: 'Mic', icon: Mic },
      { name: 'Music', icon: Music },
      { name: 'Video', icon: Video },
      { name: 'Image', icon: ImageIcon },
      { name: 'Camera', icon: Camera },
      { name: 'Gamepad', icon: Gamepad2 },
    ],
  },
  {
    category: 'Combat & Defense',
    icons: [
      { name: 'Sword', icon: Sword },
      { name: 'Shield', icon: Shield },
      { name: 'Target', icon: TargetIcon },
      { name: 'Crosshair', icon: Crosshair },
      { name: 'Axe', icon: Axe },
      { name: 'Bomb', icon: Bomb },
      { name: 'Skull', icon: Skull },
      { name: 'Hammer', icon: Hammer },
      { name: 'Anchor', icon: AnchorIcon },
    ],
  },
  {
    category: 'Vitals & Health',
    icons: [
      { name: 'Heart', icon: Heart },
      { name: 'Brain', icon: Brain },
      { name: 'Eye', icon: EyeIcon },
      { name: 'User', icon: User },
      { name: 'Fingerprint', icon: Fingerprint },
      { name: 'Pill', icon: Pill },
      { name: 'Pulse', icon: Pulse },
      { name: 'Stethoscope', icon: Stethoscope },
      { name: 'Syringe', icon: Syringe },
    ],
  },
  {
    category: 'Life & Leisure',
    icons: [
      { name: 'Coffee', icon: Coffee },
      { name: 'Cake', icon: Cake },
      { name: 'Gift', icon: Gift },
      { name: 'Wallet', icon: Wallet },
      { name: 'Shopping', icon: ShoppingCart },
      { name: 'Graduation', icon: GraduationCap },
      { name: 'Library', icon: Library },
      { name: 'Guitar', icon: Guitar },
      { name: 'Dices', icon: Dices },
    ],
  },
  {
    category: 'Creatures',
    icons: [
      { name: 'Bird', icon: Bird },
      { name: 'Fish', icon: Fish },
      { name: 'Dog', icon: Dog },
      { name: 'Cat', icon: Cat },
      { name: 'Rabbit', icon: Rabbit },
      { name: 'Turtle', icon: Turtle },
      { name: 'Ghost', icon: Ghost },
      { name: 'Squirrel', icon: Squirrel },
      { name: 'Bug', icon: Bug },
    ],
  },
];

export const FLAT_ICONS = CATEGORIZED_ICONS.flatMap(category => category.icons);
export const ICON_MAP = new Map(FLAT_ICONS.map(item => [item.name, item.icon]));

/** Pure render helper — no hook needed since ICON_MAP is module-level. */
export const renderStatIcon = (stat, size = 12) => {
  const IconComponent = ICON_MAP.get(stat.iconName) || Hash;
  return <IconComponent size={size} />;
};
