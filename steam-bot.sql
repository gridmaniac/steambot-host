/*
Navicat MySQL Data Transfer

Source Server         : default
Source Server Version : 50718
Source Host           : localhost:3306
Source Database       : steam-bot

Target Server Type    : MYSQL
Target Server Version : 50718
File Encoding         : 65001

Date: 2017-08-10 10:08:00
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
) ENGINE=InnoDB AUTO_INCREMENT=805 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of log
-- ----------------------------
INSERT INTO `log` VALUES ('0', '2017-08-10 09:36:40', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '782');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:20', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '783');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:20', 'HOST', 'Попытка получения списка пользователей группы TestRiders...', '784');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:25', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '785');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:25', 'HOST', 'Попытка получения списка пользователей группы TestRiders...', '786');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:30', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '787');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:30', 'HOST', 'Попытка получения списка пользователей группы TestRiders...', '788');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:35', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '789');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:35', 'HOST', 'Попытка получения списка пользователей группы TestRiders...', '790');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:40', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '791');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:40', 'HOST', 'Попытка получения списка пользователей группы TestRiders...', '792');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:45', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '793');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:45', 'HOST', 'Попытка получения списка пользователей группы TestRiders...', '794');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:50', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '795');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:37:50', 'HOST', 'Попытка получения списка пользователей группы TestRiders...', '796');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:40:03', 'HOST', 'Попытка получения списка пользователей группы TestRiders...', '797');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:40:25', 'HOST', 'Попытка получения списка пользователей группы TestRiders...', '798');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:53:13', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '799');
INSERT INTO `log` VALUES ('0', '2017-08-10 09:55:19', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '800');
INSERT INTO `log` VALUES ('0', '2017-08-10 10:03:59', 'HOST', 'Попытка получения списка пользователей группы RideTesters...', '801');
INSERT INTO `log` VALUES ('0', '2017-08-10 10:04:00', 'HOST', 'Попытка получения списка пользователей группы TestRiders...', '802');
INSERT INTO `log` VALUES ('0', '2017-08-10 10:04:20', 'HOST', 'Пользователь 76561198073408854 вступил в группу 103582791459815463', '803');
INSERT INTO `log` VALUES ('0', '2017-08-10 10:04:20', 'HOST', 'Пользователь 76561198073408854 вступил в группу 103582791459120719', '804');

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('35', '2', '76561198073408854', '3', '1', 'djtaffy1', '1502342652706', '1', '103582791459815463');
INSERT INTO `users` VALUES ('36', '2', '76561198015639477', '3', '0', 'djtaffy1', '1502342790250', '0', '103582791459815463');
INSERT INTO `users` VALUES ('37', '2', '76561198073408854', '3', '1', 'pimgik', '1502342685634', '1', '103582791459120719');
INSERT INTO `users` VALUES ('38', '2', '76561198015639477', '3', '0', 'pimgik', '1502342785889', '0', '103582791459120719');
