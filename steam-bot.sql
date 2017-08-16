/*
Navicat MySQL Data Transfer

Source Server         : main
Source Server Version : 50525
Source Host           : localhost:3306
Source Database       : steam-bot

Target Server Type    : MYSQL
Target Server Version : 50525
File Encoding         : 65001

Date: 2017-08-16 10:59:59
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `log`
-- ----------------------------
DROP TABLE IF EXISTS `log`;
CREATE TABLE `log` (
  `status` text,
  `timestamp` datetime DEFAULT NULL,
  `botAccountName` text,
  `message` text CHARACTER SET utf8,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of log
-- ----------------------------

-- ----------------------------
-- Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `friendState` int(11) DEFAULT NULL,
  `steamId` text,
  `chatState` int(11) DEFAULT NULL,
  `groupState` int(11) DEFAULT NULL,
  `botAccountName` text,
  `lastInvitationDate` bigint(11) DEFAULT NULL,
  `sendThanksState` tinyint(255) DEFAULT NULL,
  `groupId` text,
  `giftState` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of users
-- ----------------------------
